package org.domeos.api.service.monitor.impl;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.cluster.ClusterMonitor;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.OperationType;
import org.domeos.api.service.global.GlobalService;
import org.domeos.api.service.monitor.MonitorService;
import org.domeos.shiro.AuthUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;

/**
 * Created by feiliu206363 on 2015/12/22.
 */
@Service("monitorService")
public class MonitorServiceImpl implements MonitorService {
    private static Logger logger = LoggerFactory.getLogger(MonitorServiceImpl.class);
    @Autowired
    GlobalService globalService;

    @Override
    public void getChartsMonitor(int clusterId, HttpServletRequest request, HttpServletResponse response, long userId) {
        if (!AuthUtil.verify(userId, clusterId, ResourceType.CLUSTER, OperationType.GET)) {
            setErrorResponse(response, "forbidden");
            return;
        }
        try {
            ClusterMonitor clusterMonitor = globalService.getMonitor();
            if (clusterMonitor == null) {
                setErrorResponse(response, "cluster monitor not set");
                return;
            }
            String requestUrl = clusterMonitor.url() + "/charts";
            if (!StringUtils.isBlank(request.getQueryString())) {
                requestUrl += "?" + request.getQueryString();
            }
            transferGet(requestUrl, response, true);
        } catch (IOException e) {
            logger.warn("get monitor info error, message is " + e.getMessage());
            setErrorResponse(response, e.getMessage());
        }
    }

    @Override
    public void putChartsMonitor(int clusterId, HttpServletRequest request, HttpServletResponse response, long userId) {
        if (!AuthUtil.verify(userId, clusterId, ResourceType.CLUSTER, OperationType.GET)) {
            setErrorResponse(response, "forbidden");
            return;
        }
        try {
            ClusterMonitor clusterMonitor = globalService.getMonitor();
            if (clusterMonitor == null) {
                setErrorResponse(response, "cluster monitor not set");
                return;
            }
            String requestUrl = clusterMonitor.url() + "/chart";
            if (!StringUtils.isBlank(request.getQueryString())) {
                requestUrl += "?" + request.getQueryString();
            }
            transferPost(requestUrl, request, response);
        } catch (IOException e) {
            logger.warn("get monitor info error, message is " + e.getMessage());
            setErrorResponse(response, e.getMessage());
        }
    }

    @Override
    public void getCssMonitor(HttpServletRequest request, HttpServletResponse response, long userId) {
        ClusterMonitor clusterMonitor = globalService.getMonitor();
        if (clusterMonitor == null) {
            setErrorResponse(response, "forbidden");
            return ;
        }
        try {
            String requestUrl = clusterMonitor.url() + request.getRequestURI();
            if (!StringUtils.isBlank(request.getQueryString())) {
                requestUrl += "?" + request.getQueryString();
            }
            response.setCharacterEncoding("utf-8");
            if (request.getRequestURI().endsWith(".css") || request.getRequestURI().endsWith(".js")) {
                transferGet(requestUrl, response, false);
            } else {
                int byteRead;
                URL url = new URL(requestUrl);
                URLConnection conn = url.openConnection();
                InputStream inStream = conn.getInputStream();
                OutputStream fs = response.getOutputStream();
                byte[] buffer = new byte[1204];
                while ((byteRead = inStream.read(buffer)) != -1) {
                    fs.write(buffer, 0, byteRead);
                }
                fs.close();
                inStream.close();
            }
        } catch (IOException e) {
            logger.warn("get monitor info error, message is " + e.getMessage());
            setErrorResponse(response, e.getMessage());
        }
    }

    @Override
    public void getChartBigMonitor(int clusterId, HttpServletRequest request, HttpServletResponse response, long userId) {
        if (!AuthUtil.verify(userId, clusterId, ResourceType.CLUSTER, OperationType.GET)) {
            setErrorResponse(response, "forbidden");
            return;
        }
        ClusterMonitor clusterMonitor = globalService.getMonitor();
        if (clusterMonitor == null) {
            setErrorResponse(response, "cluster monitor not set");
            return;
        }
        try {
            String requestUrl = clusterMonitor.url() + "/chart/big";
            if (!StringUtils.isBlank(request.getQueryString())) {
                requestUrl += "?" + request.getQueryString();
            }
            transferGet(requestUrl, response, true);
        } catch (IOException e) {
            setErrorResponse(response, e.getMessage());
            logger.warn("get monitor info error, message is " + e.getMessage());
        }
    }

    @Override
    public void getChartMonitor(HttpServletRequest request, HttpServletResponse response, long userId) {
        ClusterMonitor clusterMonitor = globalService.getMonitor();
        if (clusterMonitor == null) {
            setErrorResponse(response, "cluster monitor not set");
            return ;
        }
        try {
            String requestUrl = clusterMonitor.url() + request.getRequestURI();
            if (!StringUtils.isBlank(request.getQueryString())) {
                requestUrl += "?" + request.getQueryString();
            }
            transferGet(requestUrl, response, true);
        } catch (IOException e) {
            logger.warn("get monitor info error, message is " + e.getMessage());
            setErrorResponse(response, e.getMessage());
        }
    }

    @Override
    public void getCountersMonitor(int clusterId, HttpServletRequest request, HttpServletResponse response, long userId) {
        if (!AuthUtil.verify(userId, clusterId, ResourceType.CLUSTER, OperationType.GET)) {
            setErrorResponse(response, "forbidden");
            return;
        }
        try {
            ClusterMonitor clusterMonitor = globalService.getMonitor();
            if (clusterMonitor == null) {
                setErrorResponse(response, "cluster monitor not set");
                return;
            }
            String requestUrl = clusterMonitor.url() + "/api/counters";
            if (!StringUtils.isBlank(request.getQueryString())) {
                requestUrl += "?" + request.getQueryString();
            }
            transferPost(requestUrl, request, response);
        } catch (IOException e) {
            setErrorResponse(response, e.getMessage());
            logger.warn("get monitor info error, message is " + e.getMessage());
        }
    }

    public void transferPost(String requestUrl, HttpServletRequest request, HttpServletResponse response) throws IOException {
        URL url = new URL(requestUrl);

        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setDoInput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Charsert", "UTF-8");
        conn.setRequestProperty("Content-Type", "application/json");

        OutputStream send = conn.getOutputStream();
        InputStream body = request.getInputStream();
        IOUtils.copy(body, send);
        send.flush();
        send.close();
        body.close();

        response.setHeader("Content-type", "text/html; charset=utf-8");
        response.setCharacterEncoding("utf-8");
        BufferedReader in = new BufferedReader(new InputStreamReader(
                conn.getInputStream()));
        PrintWriter out = response.getWriter();
        String line;
        while ((line = in.readLine()) != null) {
            out.println(line);
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
