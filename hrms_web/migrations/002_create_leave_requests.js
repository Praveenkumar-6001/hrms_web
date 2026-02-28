exports.up = function(knex) {
  return knex.schema.createTable('leave_requests', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.text('reason');
    table.string('status').notNullable().defaultTo('pending');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('leave_requests');
};
