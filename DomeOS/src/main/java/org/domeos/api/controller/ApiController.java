package org.domeos.api.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 */
public abstract class ApiController {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    protected ObjectMapper objectMapper;

    private ResponseEntity<String> responseToEntity(HttpResponseTemp<?> response) {
        String body = null;
        try {
            body = objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException e1) {
            logger.error("failed to translate response to json", e1);
            body = "json translate error when handle exception:" + response.getResultMsg();
        }
        return new ResponseEntity<>(body, HttpStatus.OK);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> defaultExceptionHandler(Exception e) {
        logger.error("unexpected exception happened:" + e.getMessage(), e);
        return responseToEntity(ResultStat.SERVER_INTERNAL_ERROR.wrap(null, e.getMessage()));
    }
}
