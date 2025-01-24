import { API_URL } from "./constant"

export class LangflowClient {
    private baseURL: string
  
    constructor() {
      this.baseURL = API_URL 
    }
  
    async processQuery(inputValue: string): Promise<string> {
      try {
        const response = await fetch(`${this.baseURL}/api/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: inputValue }),
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`)
        }
  
        const data = await response.json()
  
        if (data.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message?.text) {
          return data.outputs[0].outputs[0].outputs.message.message.text
        }
  
        return JSON.stringify(data)
      } catch (error) {
        console.error("Langflow Request Error:", error)
        throw error
      }
    }
  }
  
  