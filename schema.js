// for chat completion requests, the schema is the response structure
export const giftSchema = {
    type: "json_schema",
    json_schema: {
      name: "gift_suggestions",
      schema: {
        type: "object",
        properties: {
          gifts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                price_range: { type: "string" },
                why_its_good: { type: "string" },
              },
              required: ["name", "price_range", "why_its_good"],
            },
          },
        },
        required: ["gifts"],
      },
    },
  };

  // ================================================================
  // ================================================================
  // ================================================================
  // ================================================================

  
  // for responses api, it's pretty similar but with a different structure
  export const giftSchemaResponses = {
    type: "json_schema",
    name: "gift_suggestions",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        gifts: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              price_range: { type: "string" },
              why_its_good: { type: "string" },
            },
            required: ["name", "price_range", "why_its_good"],
          },
        },
      },
      required: ["gifts"],
    },
  };