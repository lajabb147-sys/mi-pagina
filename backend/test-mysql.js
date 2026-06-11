const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'laja123',
      database: 'zensei_academy',
      port: 3306
    });
    console.log('Conexion OK');
    const [rows] = await connection.query('SHOW DATABASES');
    console.log(rows.map(row => row.Database));
    await connection.end();
  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.code) console.error('code=', error.code);
    if (error.errno) console.error('errno=', error.errno);
    if (error.sqlState) console.error('sqlState=', error.sqlState);
    process.exit(1);
  }
})();
