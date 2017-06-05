package org.domeos.framework.api.service.global.impl;

import com.fasterxml.jackson.databind.JsonNode;
import org.domeos.util.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.global.WebSsh;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.service.global.WebConsoleService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.util.CommonUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by baokangwang on 2016/1/16.
 */
@Service
public class WebConsoleServiceImpl implements WebConsoleService {

    private static Logger logger = LoggerFactory.getLogger(WebConsoleServiceImpl.class);

    private Map<String, String> hostMapper = new HashMap<>();
    private Map<String, String> containerMapper = new HashMap<>();
    private String consolePrefix = "domeos";
    private String consoleSeparator = "@";

    @Autowired
    GlobalBiz globalBiz;

    @Autowired
    CustomObjectMapper mapper;

    private void checkAdmin() {
        if (!AuthUtil.isAdmin(CurrentThreadInfo.getUserId())) {
            throw new PermitException("only admin can operate webssh");
        }
    }

    @Override
    public void getWebConsole(String host, String container, ResourceType type, int id, HttpServletRequest request, HttpServletResponse response) {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.verify(userId, id, type, OperationType.MODIFY);
        try {
            String url = getRequestUrl(host, container);
            if (StringUtils.isBlank(url)) {
                return;
            }
            transferGet(url, response, true);
        } catch (IOException e) {
            logger.warn("get web console error, message is " + e.getMessage());
            setErrorResponse(response, e.getMessage());
        }
    }

    @Override
    public void postWebConsole(HttpServletRequest request, HttpServletResponse response) {

        try {
            String host = null, container = null;

            if (null != request.getParameter("rooturl")) {
                host = parseParam(request.getParameter("rooturl"), "host=");
                container = parseParam(request.getParameter("rooturl"), "container=");
            } else if (null != request.getParameter("session")) {
                host = hostMapper.get(request.getParameter("session"));
                container = containerMapper.get(request.getParameter("session"));
            }

            String requestUrl = getRequestUrl(host, container);
            if (StringUtils.isBlank(requestUrl)) {
                return;
            }
            transferPost(requestUrl, host, container, request, response);
        } catch (IOException e) {
            logger.warn("put web console error, message is " + e.getMessage());
            setErrorResponse(response, e.getMessage());
        }
    }

    @Override
    public HttpResponseTemp<?> getWebsshSetting() {
        checkAdmin();
        WebSsh webSsh = globalBiz.getWebSsh();
        return ResultStat.OK.wrap(webSsh);
    }

    @Override
    public HttpResponseTemp<?> setWebsshSetting(WebSsh webSsh) {
        checkAdmin();
        if (!StringUtils.isBlank(webSsh.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, webSsh.checkLegality());
        }
        webSsh.setCreateTime(System.currentTimeMillis());
        globalBiz.deleteWebSsh();
        globalBiz.setWebSsh(webSsh);
        return ResultStat.OK.wrap(webSsh);
    }

    @Override
    public HttpResponseTemp<?> updateWebsshSetting(WebSsh webSsh) {
        checkAdmin();
        if (!StringUtils.isBlank(webSsh.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, webSsh.checkLegality());
        }
        globalBiz.updateWebSsh(webSsh);
        return ResultStat.OK.wrap(webSsh);
    }

    @Override
    public HttpResponseTemp<?> deleteWebsshSetting() {
        checkAdmin();
        globalBiz.deleteWebSsh();
        return ResultStat.OK.wrap(null);
    }

    public String getRequestUrl(String host, String container) {
        WebSsh webSsh = globalBiz.getWebSsh();
        if (webSsh == null) {
            return null;
        }
        String requestUrl = CommonUtil.fullUrl(webSsh.getUrl());
        if (!requestUrl.endsWith("/")) {
            requestUrl += "/";
        }
        if (null != host) {
            requestUrl = requestUrl + consolePrefix + consoleSeparator + host + consoleSeparator;
            if (null != container) {
                requestUrl += container;
                requestUrl += consoleSeparator;
            }
        }
        return requestUrl;
    }

    public String parseParam(String source, String key) {

        int lastIndex = source.lastIndexOf("?");
        if (lastIndex == -1) {
            return null;
        } else {
            source = source.substring(lastIndex + 1);
            if (!source.contains(key)) {
                return null;
            } else {
                int indexOfKey = source.indexOf(key);
                String value = source.substring(indexOfKey + key.length());
                if (value.contains("&")) {
                    value = value.substring(0, value.indexOf("&"));
                }
                return value;
            }
        }
    }

    public void transferPost(String requestUrl, String host, String container, HttpServletRequest request, HttpServletResponse response) throws IOException {
        URL url = new URL(requestUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setDoInput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Charsert", "UTF-8");
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

        Map<String, String[]> paramMap = request.getParameterMap();
        String params = "";
        for (Map.Entry<String, String[]> entry : paramMap.entrySet()) {
            params += entry.getKey();
            params += "=";
            params += entry.getValue()[0];
            params += "&";
        }
        params = params.substring(0, params.length() - 1);
        byte[] data = params.getBytes("UTF-8");
        OutputStream outStream = conn.getOutputStream();
        outStream.write(data);
        outStream.flush();
        outStream.close();

        BufferedReader in = new BufferedReader(new InputStreamReader(
                conn.getInputStream()));
        PrintWriter out = response.getWriter();
        String line;
        while ((line = in.readLine()) != null) {
            out.println(line);
            if (null != request.getParameter("rooturl")) {
                try {
                    JsonNode result = mapper.readTree(line);
                    String session = result.get("session").asText();
                    if (host != null) {
                        hostMapper.put(session, host);
                    }
                    if (container != null) {
                        containerMapper.put(session, container);
                    }
                } catch (Exception e) {
                    logger.warn(e.getMessage() + ", invalid json response: {}", line);
                }
            }
        }
        out.flush();
        out.close();
        in.close();
    }

    public void transferGet(String requestUrl, HttpServletResponse response, boolean textHearder) throws IOException {
        URL url = new URL(requestUrl);
        BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream(), "utf-8"));

        if (textHearder) {
            response.setHeader("Content-type", "text/html; charset=utf-8");
        }
        response.setCharacterEncoding("utf-8");
        String line;
        PrintWriter out = response.getWriter();
        while ((line = in.readLine()) != null) {
            out.println(line);
        }
        out.flush();
        out.close();
        in.close();
    }

    public void setErrorResponse(HttpServletResponse response, String message) {
        response.setStatus(400);
        response.setCharacterEncoding("utf-8");
        try {
            OutputStream outputStream = response.getOutputStream();
            outputStream.write(message.getBytes());
            outputStream.close();
        } catch (IOException e) {
            logger.warn("write error message error, " + e.getMessage());
        }
    }
}
