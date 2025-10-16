const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}


const perguntarAI = async (apiKey, game, question) => {
  const model = 'gemini-2.0-flash'
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const pergunta = `
    ##especialidade
    Voce é um especialista em assistente de meta para o jogo ${game}.

    ##tarefa
    Voce deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas

    ##regras
    - Se você não sabe a resposta, responda com 'não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza que existe no patch atual.

    ##resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
    
    ##exemplo de resposta
    Pergunta do usuário: Melhor build renga jungle
    Resposta: A build mais atual é \n \n **Itens:**\n\n coloque os itens aqui.\n\n **Runas:**\n\nexemplo de runas\n\n

    ---
    Aqui está a pergunta do usuário: ${question}  
  `
  const contents = [{
    role: "user",
    parts: [{
      text: pergunta
    }]
  }] 

  const tools = [{
    google_search: {}
  }]

  //chamada para a API Gemini
  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      tools
      })
  })

  const data = await response.json()
  return data.candidates[0].content.parts[0].text 
}

const enviarFormulario = async (event) => {
  event.preventDefault()
  const apiKey = apiKeyInput.value
  const game = gameSelect.value
  const question = questionInput.value

  if (apiKey == '' || game == '' || question == '') {
    alert('Por favor, preencha todos os campos.')
    return
  }
  askButton.disabled = true
  askButton.textContent = 'perguntando...'
  askButton.classList.add('loading')

  try {
    const text = await perguntarAI(apiKey, game, question)
    aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
    aiResponse.classList.remove('hidden')
  } catch (error){
    console.log("Erro :", error)
  } finally {
    askButton.disabled = false
    askButton.textContent = 'Perguntar'
    askButton.classList.remove('loading')
  }
}
form.addEventListener('submit', enviarFormulario)
