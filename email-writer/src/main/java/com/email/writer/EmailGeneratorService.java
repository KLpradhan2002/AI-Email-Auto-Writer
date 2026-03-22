package com.email.writer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriBuilder;

@Service
public class EmailGeneratorService {

        private final WebClient webClient;
        private final String apiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder,
                                 @Value("${gemini.api.url}") String baseUrl,
                                 @Value("${gemini.api.key}") String geminiApiKey) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.apiKey = geminiApiKey;
    }

    public String generateEmailReply(EmailRequest emailRequest) {
        //build prompt
        String prompt=buildPrompt(emailRequest);
        //prepare raw json
        String  requestBody= String.format("""
                {
                    "contents": [
                      {
                        "parts": [
                          {
                            "text": "%s"
                          }
                        ]
                      }
                    ]
                  }
                """,prompt);
        //send req
        String response=webClient.post()
                        .uri(uriBuilder -> uriBuilder
                                .path("/v1beta/models/gemini-3-flash-preview:generateContent")
                                .build())
                        .header("x-goog-api-key",apiKey)
                        .header("Content-Type","application/json")
                        .bodyValue(requestBody)
                        .retrieve().bodyToMono(String.class).block();
        //extract response
        return extractResponseContent(response);

    }

    private String extractResponseContent(String response) {

        try {
            ObjectMapper mapper= new ObjectMapper();
            JsonNode root=mapper.readTree(response);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText() ;
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }


    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt=new StringBuilder();
        prompt.append("Generate ONLY ONE professional email reply for the following email "
                + "Do not give multiple options. Do not number responses. " + "Return a single concise reply only without subject.Email:\n");
        if(emailRequest.getTone()!=null&& !emailRequest.getTone().isEmpty()){
            prompt.append("Use a").append(emailRequest.getTone()).append(" tone.");
        }
        prompt.append("Original Email:\n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}

