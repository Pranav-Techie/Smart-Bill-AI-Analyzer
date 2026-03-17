import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"

const app = express()

app.use(cors())
app.use(bodyParser.json())

const client = new BedrockRuntimeClient({
  region: "us-east-1"
})

app.post("/analyze-bill", async (req,res)=>{

  try{

    const text = req.body.text
    console.log("User text:", text)

    const command = new ConverseCommand({
      modelId: "amazon.nova-lite-v1:0",
      messages: [
        {
          role: "user",
          content: [
            {
              text: `Extract bill information from this text.

Return ONLY valid JSON.

Example:
{
"billType":"Electricity Bill",
"amount":"1800",
"dueDate":"March 22"
}

Text: ${text}`
            }
          ]
        }
      ]
    })

    const response = await client.send(command)

    const output = response.output.message.content[0].text

    console.log("Nova raw response:", output)

    // 🔧 Extract JSON safely
    const jsonMatch = output.match(/\{[\s\S]*\}/)

    if(!jsonMatch){
      throw new Error("No JSON found in Nova response")
    }

    const parsed = JSON.parse(jsonMatch[0])

    res.json(parsed)

  }catch(error){

    console.log("Nova error:", error)

    res.json({
      billType:"Unknown Bill",
      amount:"Not Detected",
      dueDate:"Not Detected"
    })

  }

})

app.listen(5000,()=>{
  console.log("Nova AI server running on port 5000")
})