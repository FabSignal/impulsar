#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, Address, Env, Vec,
    symbol_short
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InsufficientFunds = 1,
    InvalidAmount = 2,
    BatchTooLarge = 3,
}

#[contract]
pub struct TransferEngine;

#[contractimpl]
impl TransferEngine {
    /// Transfer unidades ARU de una address a otra
    ///
    /// # Arguments
    /// * `from` - Source address (debe firmar transacción)
    /// * `to` - Destination address
    /// * `aru_units` - Cantidad de UNIDADES ARU (NOT pesos)
    ///
    /// # Returns
    /// * `Result<(), Error>` - Success o error
    ///
    /// # Events
    /// Emite: TransferExecuted(from, to, aru_units, timestamp)
    ///
    /// # Example
    /// ```
    /// // Usuario tiene 100 ARU (≈ $105.000 si CER = 1050)
    /// // Quiere pagar $10.000 pesos
    /// // Frontend calcula: 10.000 / 1050 = 9.52 ARU
    /// transfer(env, user, comercio, 9.52)
    /// ```
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        aru_units: i128,
    ) -> Result<(), Error> {
        // PASO 1: Autenticación
        from.require_auth();

        // PASO 2: Validación de amount (debe ser > 0)
        if aru_units <= 0 {
            return Err(Error::InvalidAmount);
        }

        // PASO 3: Get balances (en UNIDADES ARU)
        let balance_from = Self::get_balance(&env, &from);
        let balance_to = Self::get_balance(&env, &to);

        // PASO 4: Validación de fondos
        if balance_from < aru_units {
            return Err(Error::InsufficientFunds);
        }

        // PASO 5: Ejecutar transfer (atómico)
        Self::set_balance(&env, &from, balance_from - aru_units);
        Self::set_balance(&env, &to, balance_to + aru_units);

        // PASO 6: Emit event
        // IMPORTANTE: Event registra UNIDADES ARU, NO pesos
        env.events().publish(
            (symbol_short!("transfer"),),
            (
                from,
                to,
                aru_units,
                env.ledger().timestamp()
            )
        );

        Ok(())
    }

    /// Batch transfer a múltiples destinatarios
    ///
    /// # Arguments
    /// * `from` - Source address (distributor)
    /// * `recipients` - Vec de (address, aru_units) tuples (max 100)
    ///
    /// # Returns
    /// * `Result<u32, Error>` - Count de transfers exitosos o error
    ///
    /// # Example
    /// ```
    /// // Distribución mensual AUH
    /// // Cada beneficiario recibe $140.000 pesos
    /// // CER actual = 1050.23
    /// // ARU por beneficiario = 140.000 / 1050.23 = 133.31 ARU
    ///
    /// let recipients = vec![
    ///     (maria_address, 133.31),  // 133.31 ARU
    ///     (juan_address, 133.31),
    ///     // ... hasta 100
    /// ];
    ///
    /// batch_transfer(env, distributor, recipients);
    /// ```
    pub fn batch_transfer(
        env: Env,
        from: Address,
        recipients: Vec<(Address, i128)>,
    ) -> Result<u32, Error> {
        // PASO 1: Autenticación
        from.require_auth();

        // PASO 2: Validación de batch size
        let recipient_count = recipients.len();
        if recipient_count > 100 {
            return Err(Error::BatchTooLarge);
        }

        // PASO 3: Calcular total ARU units needed
        let mut total_aru_units: i128 = 0;
        for i in 0..recipient_count {
            let (_, aru_units) = recipients.get(i).unwrap();
            
            if aru_units <= 0 {
                return Err(Error::InvalidAmount);
            }
            
            total_aru_units += aru_units;
        }

        // PASO 4: Validación de fondos totales
        let balance_from = Self::get_balance(&env, &from);
        if balance_from < total_aru_units {
            return Err(Error::InsufficientFunds);
        }

        // PASO 5: Ejecutar batch (all-or-nothing atomicity)
        let mut success_count: u32 = 0;
        for i in 0..recipient_count {
            let (to, aru_units) = recipients.get(i).unwrap();
            let balance_to = Self::get_balance(&env, &to);
            Self::set_balance(&env, &to, balance_to + aru_units);
            success_count += 1;
        }

        // PASO 6: Deducir total del distributor
        Self::set_balance(&env, &from, balance_from - total_aru_units);

        // PASO 7: Emit event
        env.events().publish(
            (symbol_short!("batch"),),
            (
                from,
                success_count,
                total_aru_units,  // Total en UNIDADES ARU
                env.ledger().timestamp()
            )
        );

        Ok(success_count)
    }

    /// Obtener balance para una address
    ///
    /// # Returns
    /// * `i128` - Balance en UNIDADES ARU (NOT pesos)
    ///
    /// # Example
    /// ```
    /// let balance_aru = get_balance(env, maria_address);
    /// // Retorna: 100 (unidades ARU)
    ///
    /// // Para mostrar en pesos, frontend debe calcular:
    /// // let cer = await getCER();
    /// // let pesos = balance_aru * cer; // 100 * 1050 = $105.000
    /// ```
    pub fn get_balance(env: &Env, address: &Address) -> i128 {
        let key = (symbol_short!("balance"), address.clone());
        env.storage()
            .persistent()
            .get(&key)
            .unwrap_or(0)
    }

    /// Internal: Set balance para una address
    fn set_balance(env: &Env, address: &Address, aru_units: i128) {
        let key = (symbol_short!("balance"), address.clone());
        env.storage()
            .persistent()
            .set(&key, &aru_units);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};

    #[test]
    fn test_transfer_aru_units() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TransferEngine);
        let client = TransferEngineClient::new(&env, &contract_id);

        let alice = Address::generate(&env);
        let bob = Address::generate(&env);

        // Alice tiene 100 ARU units
        env.as_contract(&contract_id, || {
            TransferEngine::set_balance(&env, &alice, 100);
        });

        env.mock_all_auths();

        // Transfer 9.52 ARU (equivalente a ~$10.000 si CER = 1050)
        let result = client.transfer(&alice, &bob, &9);
        assert_eq!(result, Ok(()));

        // Verify balances (en UNIDADES ARU)
        let alice_balance = client.get_balance(&alice);
        let bob_balance = client.get_balance(&bob);

        assert_eq!(alice_balance, 91);  // 100 - 9 = 91 ARU
        assert_eq!(bob_balance, 9);     // 0 + 9 = 9 ARU
    }

    #[test]
    fn test_batch_transfer_with_cer_calculation() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TransferEngine);
        let client = TransferEngineClient::new(&env, &contract_id);

        let distributor = Address::generate(&env);
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let user3 = Address::generate(&env);

        // Distributor tiene suficiente ARU para distribución
        // Ejemplo: 3 beneficiarios × 133.31 ARU = 399.93 ARU
        env.as_contract(&contract_id, || {
            TransferEngine::set_balance(&env, &distributor, 400);
        });

        env.mock_all_auths();

        // Simular distribución AUH:
        // - Cada beneficiario recibe $140.000 pesos
        // - CER = 1050.23
        // - ARU por beneficiario = 140.000 / 1050.23 ≈ 133.31 ARU
        let recipients = Vec::from_array(
            &env,
            [
                (user1.clone(), 133),  // 133 ARU ≈ $139.680
                (user2.clone(), 133),
                (user3.clone(), 133),
            ],
        );

        let result = client.batch_transfer(&distributor, &recipients);
        assert_eq!(result, Ok(3));

        // Verify balances (en UNIDADES ARU)
        assert_eq!(client.get_balance(&distributor), 1);  // 400 - 399 ≈ 1
        assert_eq!(client.get_balance(&user1), 133);
        assert_eq!(client.get_balance(&user2), 133);
        assert_eq!(client.get_balance(&user3), 133);
    }

    #[test]
    fn test_insufficient_funds() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TransferEngine);
        let client = TransferEngineClient::new(&env, &contract_id);

        let alice = Address::generate(&env);
        let bob = Address::generate(&env);

        // Alice tiene solo 10 ARU
        env.as_contract(&contract_id, || {
            TransferEngine::set_balance(&env, &alice, 10);
        });

        env.mock_all_auths();

        // Intenta transferir 100 ARU (más de lo que tiene)
        let result = client.try_transfer(&alice, &bob, &100);
        assert_eq!(result, Err(Ok(Error::InsufficientFunds)));
    }
}