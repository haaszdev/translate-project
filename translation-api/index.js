require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const TranslationRequest = require('./models/TranslationRequest')
const { connectRabbitMQ, sendToQueue } = require('./services/queue')

const app = express()
app.use(express.json())

mongoose.connect(process.env.MONGO_URL)

connectRabbitMQ().then(() => {
  console.log('Conectado ao RabbitMQ')
})

app.post('/translations', async (req, res) => {
  const { originalText, targetLanguage } = req.body
  const requestId = uuidv4()

  const newRequest = new TranslationRequest({
    requestId,
    originalText,
    targetLanguage,
    status: 'queued'
  })
  await newRequest.save()

  await sendToQueue({ requestId, originalText, targetLanguage })

  res.status(202).json({
    requestId,
    message: 'Sua solicitação de tradução está em andamento.'
  })
})

app.get('/translations/:requestId', async (req, res) => {
  const translation = await TranslationRequest.findOne({ requestId: req.params.requestId })

  if (!translation) {
    return res.status(404).json({ error: 'Requisição não localizada.' })
  }

  res.json({
    requestId: translation.requestId,
    status: translation.status,
    translatedText: translation.translatedText || null
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`)
})