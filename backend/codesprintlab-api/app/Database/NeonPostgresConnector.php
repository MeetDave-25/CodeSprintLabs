<?php

namespace App\Database;

use Illuminate\Database\Connectors\PostgresConnector;

/**
 * Custom connector that appends the Neon endpoint ID to the DSN options
 * to work around SNI-unsupported libpq versions (e.g. bundled with XAMPP).
 *
 * Neon requires: options='endpoint=<endpoint-id>' in the DSN when libpq
 * does not support Server Name Indication (SNI).
 */
class NeonPostgresConnector extends PostgresConnector
{
    /**
     * Create a DSN string from a configuration.
     *
     * @param  array  $config
     * @return string
     */
    protected function getDsn(array $config)
    {
        $dsn = parent::getDsn($config);

        if (!empty($config['neon_endpoint'])) {
            $dsn .= ";options='endpoint=" . $config['neon_endpoint'] . "'";
        }

        return $dsn;
    }
}
