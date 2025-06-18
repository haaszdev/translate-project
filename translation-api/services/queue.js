const amqplib = require('amqplib')

let channel

async function connectRabbitMQ() {
  const connection = await amqplib.connect(process.env.RABBITMQ_URL)
  channel = await connection.createChannel()
  await channel.assertQueue('translation_queue')
}

async function sendToQueue(payload) {
  channel.sendToQueue('translation_queue', Buffer.from(JSON.stringify(payload)))
}

module.exports = { connectRabbitMQ, sendToQueue }