package org.domeos.framework.api.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.DeployIlegalException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 */
public abstract class ApiController {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    @Qualifier("objectMapper")
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

    @ExceptionHandler(PermitException.class)
    public ResponseEntity<String> permitExceptionHandler(PermitException e) {
        logger.error("unexpected exception happened:" + e.getMessage(), e);
        return responseToEntity(ResultStat.FORBIDDEN.wrap(null, e.getMessage()));
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<String> depolyExceptionHandler(ApiException e) {
        return responseToEntity(e.getStat().wrap(null, e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> defaultExceptionHandler(Exception e) {
        logger.error("unexpected exception happened:" + e.getMessage(), e);
        return responseToEntity(ResultStat.SERVER_INTERNAL_ERROR.wrap(null, e.getMessage()));
    }


}
