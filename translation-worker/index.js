require('dotenv').config()
const mongoose = require('mongoose')
const axios = require('axios')
const { connectRabbitMQ, consumeQueue } = require('./services/queue')
const TranslationRequest = require('./models/TranslationRequest')

mongoose.connect(process.env.MONGO_URL)

async function performTranslation(text, targetLanguage) {
  const response = await axios.post('https://libretranslate.de/translate', {
    q: text,
    source: 'en',
    target: targetLanguage,
    format: 'text'
  })
  return response.data.translatedText
}

async function handleMessage(data) {
  const { requestId, originalText, targetLanguage } = data

  await TranslationRequest.findOneAndUpdate(
    { requestId },
    { status: 'processing', updatedAt: new Date() }
  )

  try {
    const translatedText = await performTranslation(originalText, targetLanguage)

    await TranslationRequest.findOneAndUpdate(
      { requestId },
      { status: 'completed', translatedText, updatedAt: new Date() }
    )
  } catch (err) {
    await TranslationRequest.findOneAndUpdate(
      { requestId },
      { status: 'failed', updatedAt: new Date() }
    )
  }
}

async function bootstrap() {
  await connectRabbitMQ()
  await consumeQueue(handleMessage)
}

bootstrap()