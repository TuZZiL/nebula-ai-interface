Typescript:
async function invokeChute() {
			const response = await fetch("https://llm.chutes.ai/v1/chat/completions", {
					method: "POST",
					headers: {
						"Authorization": "Bearer $CHUTES_API_TOKEN",
			"Content-Type": "application/json"
					},
					body: JSON.stringify(			{
			  "model": "deepseek-ai/DeepSeek-V3-0324",
			  "messages": [
			    {
			      "role": "user",
			      "content": "Tell me a 250 word story."
			    }
			  ],
			  "stream": true,
			  "max_tokens": 1024,
			  "temperature": 0.7
			})
			});
			
			const data = await response.json();
			console.log(data);
		}

		invokeChute();

Input Schema:
{
  "type": "object",
  "required": [
    "input_args"
  ],
  "properties": {
    "input_args": {
      "$ref": "#/definitions/ChatCompletionRequest"
    }
  },
  "definitions": {
    "ChatCompletionRequest": {
      "type": "object",
      "$defs": {
        "ChatMessage": {
          "type": "object",
          "title": "ChatMessage",
          "required": [
            "role",
            "content"
          ],
          "properties": {
            "role": {
              "type": "string",
              "title": "Role"
            },
            "content": {
              "type": "string",
              "title": "Content"
            }
          }
        },
        "ResponseFormat": {
          "type": "object",
          "title": "ResponseFormat",
          "required": [
            "type"
          ],
          "properties": {
            "type": {
              "enum": [
                "text",
                "json_object",
                "json_schema"
              ],
              "type": "string",
              "title": "Type"
            },
            "json_schema": {
              "anyOf": [
                {
                  "type": "object"
                },
                {
                  "type": "null"
                }
              ],
              "title": "Json Schema",
              "default": null
            }
          }
        }
      },
      "required": [
        "model",
        "messages"
      ],
      "properties": {
        "seed": {
          "anyOf": [
            {
              "type": "integer",
              "maximum": 9223372036854776000,
              "minimum": 0
            },
            {
              "type": "null"
            }
          ],
          "title": "Seed",
          "default": null
        },
        "stop": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            {
              "type": "null"
            }
          ],
          "title": "Stop"
        },
        "min_p": {
          "type": "number",
          "title": "Min P",
          "default": 0
        },
        "model": {
          "type": "string",
          "title": "Model"
        },
        "top_k": {
          "type": "integer",
          "title": "Top K",
          "default": -1
        },
        "top_p": {
          "anyOf": [
            {
              "type": "number"
            },
            {
              "type": "null"
            }
          ],
          "title": "Top P",
          "default": 1
        },
        "stream": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "type": "null"
            }
          ],
          "title": "Stream",
          "default": false
        },
        "best_of": {
          "anyOf": [
            {
              "type": "integer"
            },
            {
              "type": "null"
            }
          ],
          "title": "Best Of",
          "default": null
        },
        "logprobs": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "type": "null"
            }
          ],
          "title": "Logprobs",
          "default": false
        },
        "messages": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/ChatMessage"
          },
          "title": "Messages"
        },
        "ignore_eos": {
          "type": "boolean",
          "title": "Ignore Eos",
          "default": false
        },
        "logit_bias": {
          "anyOf": [
            {
              "type": "object",
              "additionalProperties": {
                "type": "number"
              }
            },
            {
              "type": "null"
            }
          ],
          "title": "Logit Bias",
          "default": null
        },
        "max_tokens": {
          "anyOf": [
            {
              "type": "integer"
            },
            {
              "type": "null"
            }
          ],
          "title": "Max Tokens",
          "default": null
        },
        "min_tokens": {
          "type": "integer",
          "title": "Min Tokens",
          "default": 0
        },
        "temperature": {
          "anyOf": [
            {
              "type": "number"
            },
            {
              "type": "null"
            }
          ],
          "title": "Temperature",
          "default": 0.7
        },
        "top_logprobs": {
          "anyOf": [
            {
              "type": "integer"
            },
            {
              "type": "null"
            }
          ],
          "title": "Top Logprobs",
          "default": 0
        },
        "length_penalty": {
          "type": "number",
          "title": "Length Penalty",
          "default": 1
        },
        "stop_token_ids": {
          "anyOf": [
            {
              "type": "array",
              "items": {
                "type": "integer"
              }
            },
            {
              "type": "null"
            }
          ],
          "title": "Stop Token Ids"
        },
        "prompt_logprobs": {
          "anyOf": [
            {
              "type": "integer"
            },
            {
              "type": "null"
            }
          ],
          "title": "Prompt Logprobs",
          "default": null
        },
        "response_format": {
          "anyOf": [
            {
              "$ref": "#/definitions/ResponseFormat"
            },
            {
              "type": "null"
            }
          ],
          "default": null
        },
        "use_beam_search": {
          "type": "boolean",
          "title": "Use Beam Search",
          "default": false
        },
        "presence_penalty": {
          "anyOf": [
            {
              "type": "number"
            },
            {
              "type": "null"
            }
          ],
          "title": "Presence Penalty",
          "default": 0
        },
        "frequency_penalty": {
          "anyOf": [
            {
              "type": "number"
            },
            {
              "type": "null"
            }
          ],
          "title": "Frequency Penalty",
          "default": 0
        },
        "repetition_penalty": {
          "type": "number",
          "title": "Repetition Penalty",
          "default": 1
        },
        "skip_special_tokens": {
          "type": "boolean",
          "title": "Skip Special Tokens",
          "default": true
        },
        "include_stop_str_in_output": {
          "type": "boolean",
          "title": "Include Stop Str In Output",
          "default": false
        },
        "spaces_between_special_tokens": {
          "type": "boolean",
          "title": "Spaces Between Special Tokens",
          "default": true
        }
      }
    }
  }
}
Output Schema:
{
  "type": "object",
  "$defs": {
    "UsageInfo": {
      "type": "object",
      "title": "UsageInfo",
      "properties": {
        "total_tokens": {
          "type": "integer",
          "title": "Total Tokens",
          "default": 0
        },
        "prompt_tokens": {
          "type": "integer",
          "title": "Prompt Tokens",
          "default": 0
        },
        "completion_tokens": {
          "anyOf": [
            {
              "type": "integer"
            },
            {
              "type": "null"
            }
          ],
          "title": "Completion Tokens",
          "default": 0
        }
      }
    },
    "DeltaMessage": {
      "type": "object",
      "title": "DeltaMessage",
      "properties": {
        "role": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ],
          "title": "Role",
          "default": null
        },
        "content": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ],
          "title": "Content",
          "default": null
        }
      }
    },
    "ChatCompletionLogProb": {
      "type": "object",
      "title": "ChatCompletionLogProb",
      "required": [
        "token"
      ],
      "properties": {
        "bytes": {
          "anyOf": [
            {
              "type": "array",
              "items": {
                "type": "integer"
              }
            },
            {
              "type": "null"
            }
          ],
          "title": "Bytes",
          "default": null
        },
        "token": {
          "type": "string",
          "title": "Token"
        },
        "logprob": {
          "type": "number",
          "title": "Logprob",
          "default": -9999
        }
      }
    },
    "ChatCompletionLogProbs": {
      "type": "object",
      "title": "ChatCompletionLogProbs",
      "properties": {
        "content": {
          "anyOf": [
            {
              "type": "array",
              "items": {
                "$ref": "#/definitions/ChatCompletionLogProbsContent"
              }
            },
            {
              "type": "null"
            }
          ],
          "title": "Content",
          "default": null
        }
      }
    },
    "ChatCompletionLogProbsContent": {
      "type": "object",
      "title": "ChatCompletionLogProbsContent",
      "required": [
        "token"
      ],
      "properties": {
        "bytes": {
          "anyOf": [
            {
              "type": "array",
              "items": {
                "type": "integer"
              }
            },
            {
              "type": "null"
            }
          ],
          "title": "Bytes",
          "default": null
        },
        "token": {
          "type": "string",
          "title": "Token"
        },
        "logprob": {
          "type": "number",
          "title": "Logprob",
          "default": -9999
        },
        "top_logprobs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/ChatCompletionLogProb"
          },
          "title": "Top Logprobs"
        }
      }
    },
    "ChatCompletionResponseStreamChoice": {
      "type": "object",
      "title": "ChatCompletionResponseStreamChoice",
      "required": [
        "index",
        "delta"
      ],
      "properties": {
        "delta": {
          "$ref": "#/definitions/DeltaMessage"
        },
        "index": {
          "type": "integer",
          "title": "Index"
        },
        "logprobs": {
          "anyOf": [
            {
              "$ref": "#/definitions/ChatCompletionLogProbs"
            },
            {
              "type": "null"
            }
          ],
          "default": null
        },
        "stop_reason": {
          "anyOf": [
            {
              "type": "integer"
            },
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ],
          "title": "Stop Reason",
          "default": null
        },
        "finish_reason": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ],
          "title": "Finish Reason",
          "default": null
        }
      }
    }
  },
  "required": [
    "id",
    "created",
    "model",
    "choices"
  ],
  "properties": {
    "id": {
      "type": "string",
      "title": "Id"
    },
    "model": {
      "type": "string",
      "title": "Model"
    },
    "usage": {
      "anyOf": [
        {
          "$ref": "#/definitions/UsageInfo"
        },
        {
          "type": "null"
        }
      ],
      "default": null
    },
    "object": {
      "enum": [
        "chat.completion.chunk"
      ],
      "type": "string",
      "const": "chat.completion.chunk",
      "title": "Object",
      "default": "chat.completion.chunk"
    },
    "choices": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/ChatCompletionResponseStreamChoice"
      },
      "title": "Choices"
    },
    "created": {
      "type": "integer",
      "title": "Created"
    }
  }
}