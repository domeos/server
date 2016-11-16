package org.domeos.framework.api.service.alarm.impl;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.PoolingClientConnectionManager;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.CoreConnectionPNames;
import org.apache.http.params.HttpParams;
import org.apache.http.util.EntityUtils;
import org.apache.log4j.Logger;
import org.domeos.util.MD5Util;

import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by feiliu206363 on 2016/11/14.
 */

public enum Wechat {
    INSTANCE;

    private static Logger logger = Logger.getLogger(Wechat.class);

    private final static String WECHAT_HOST = "http://sms.tv.sohuno.com/wms/send.do";
    private final static String APPID = "101107";
    private final static String APP_KEY = "2e8f0780d2a8a04caeb5716562981dc3";
    private final static String PARAM_APPID = "appid";
    private final static String PARAM_DESTNUMBER = "destnumber";
    private final static String PARAM_CONTENT = "content";
    private final static String PARAM_TIMESTAMP = "timestamp";
    private final static String PARAM_ENC = "enc";

    private HttpClient httpclient = null;

    Wechat() {
        PoolingClientConnectionManager pcm = new PoolingClientConnectionManager();
        pcm.setMaxTotal(640);
        pcm.setDefaultMaxPerRoute(160);
        HttpParams params = new BasicHttpParams();
        params.setIntParameter(CoreConnectionPNames.CONNECTION_TIMEOUT, 5000);
        params.setIntParameter(CoreConnectionPNames.SO_TIMEOUT, 5000);
        httpclient = new DefaultHttpClient(pcm, params);
    }

    public boolean send(String destnumber, String content) {
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String enc = "";
        try {
            enc = MD5Util.md5((APPID + destnumber + timestamp + APP_KEY).getBytes("utf-8"));
        } catch (UnsupportedEncodingException | NoSuchAlgorithmException e) {
            logger.error("send wechat messages error.", e);
            return false;
        }

        Map<String, String> params = new HashMap<>();
        params.put(PARAM_APPID, APPID);
        params.put(PARAM_DESTNUMBER, destnumber);
        params.put(PARAM_CONTENT, content);
        params.put(PARAM_TIMESTAMP, timestamp);
        params.put(PARAM_ENC, enc);

        Map<String, String> sortedMap = new TreeMap<>(new Comparator<String>() {
            @Override
            public int compare(String arg0, String arg1) {
                return arg0.compareToIgnoreCase(arg1);
            }
        });
        sortedMap.putAll(params);
        List<NameValuePair> postparams = new ArrayList<>();
        for (String s : sortedMap.keySet()) {
            postparams.add(new BasicNameValuePair(s, sortedMap.get(s)));
        }

        HttpPost httpPost = new HttpPost(WECHAT_HOST);
        try {
            httpPost.setEntity(new UrlEncodedFormEntity(postparams, "utf8"));
            HttpResponse response = httpclient.execute(httpPost);
            HttpEntity entity = response.getEntity();
            String result = EntityUtils.toString(entity);
            if (response.getStatusLine().getStatusCode() != 200) {
                logger.error("send wechat messages error. msg: " + result);
                return false;
            }

            logger.info("send wechat message success. msg: " + result);
        } catch (Exception e) {
            logger.error("send error :" + e.getMessage());
            return false;
        } finally {
            httpPost.releaseConnection();
        }

        return true;
    }
}