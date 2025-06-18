const amqplib = require('amqplib')

let channel

async function connectRabbitMQ() {
  const connection = await amqplib.connect(process.env.RABBITMQ_URL)
  channel = await connection.createChannel()
  await channel.assertQueue('translation_queue')
}

async function consumeQueue(callback) {
  await channel.consume('translation_queue', async (msg) => {
    if (msg) {
      const data = JSON.parse(msg.content.toString())
      try {
        await callback(data)
        channel.ack(msg)
      } catch (err) {
        channel.nack(msg, false, false)
      }
    }
  })
}

module.exports = { connectRabbitMQ, consumeQueue }