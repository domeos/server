package org.domeos.framework.api.service.alarm.impl;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.domeos.util.CryptUtil;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Set;

/**
 * Created by baokangwang on 2016/5/6.
 */
public class SMSSender {

    private static Logger logger = LoggerFactory.getLogger(SMSSender.class);

    private final String SMS_HOST = "http://i.sms.sohu.com/WLS/smsaccess/mt";
    private final String PARAM_APPID = "appid";
    private final String VALUE_APPID = "100185";
    private final String PARAM_DESTNUM = "destnumber";
    private final String PARAM_CONTENT = "content";
    private final String PARAM_TAILSP = "tailsp";
    private final String VALUE_TAILSP = "00";
    private final String PARAM_TIMESTAMP = "timestamp";
    private final String PARAM_LINKID = "linkid";
    private final String VALUE_LINKID = "0";
    private final String PARAM_PRIORITY = "priority";
    private final String VALUE_PRIORITY = "3";
    private final String PARAM_ENC = "enc";
    private final String VALUE_KEY = "20140512151802213SMSPLATACCESS099290";

    public void sendSMS(Set<String> setNum, String strMessage) throws Exception {
        String strQueryString = getQueryString(setNum, strMessage);
        String strUrl = String.format("%s?%s", SMS_HOST, strQueryString);

        logger.info("sending sms : url " + strUrl);
        HttpClient httpclient = HttpClients.custom().build();
        HttpGet httpGet = new HttpGet(strUrl);

        try {
            HttpResponse httpResponse = httpclient.execute(httpGet);
            int code = httpResponse.getStatusLine().getStatusCode();
            if (200 != code) {
                throw new Exception("return code not 200 OK");
            }
        } catch (Exception e) {
            throw new Exception(String.format("fail to send sms : detail[%s].", e.getMessage()));
        }
    }

    private String getQueryString(Set<String> setNum, String strMessage) throws Exception {
        StringBuilder stringBuilder = new StringBuilder();
        for (String strNum : setNum) {
            if (null != strNum) {
                stringBuilder.append(strNum).append(",");
            }
        }
        String strMobileList = stringBuilder.toString();
        if (!strMobileList.isEmpty()) {
            strMobileList = strMobileList.substring(0, strMobileList.length() - 1);
        }

        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
        Date now = new Date();
        String strNow = simpleDateFormat.format(now);

        String strSeed = String.format("%s%s%s%s%s", VALUE_APPID, strMobileList, strMessage, strNow, VALUE_KEY);
        byte[] streamSeed = strSeed.getBytes("utf-8");
        String strEncyValue = CryptUtil.getInstance().byteArrayToMD5(streamSeed, 0, streamSeed.length);

        try {
            strMobileList = URLEncoder.encode(strMobileList, "utf-8");
            strMessage = URLEncoder.encode(strMessage, "utf-8");
        } catch (UnsupportedEncodingException e) {
            // Do Nothing
        }

        String strQueryString = String.format("%s=%s&%s=%s&%s=%s&%s=%s&%s=%s&%s=%s&%s=%s&%s=%s",
                PARAM_APPID, VALUE_APPID, PARAM_DESTNUM, strMobileList, PARAM_CONTENT, strMessage,
                PARAM_TAILSP, VALUE_TAILSP, PARAM_TIMESTAMP, strNow, PARAM_LINKID, VALUE_LINKID,
                PARAM_PRIORITY, VALUE_PRIORITY, PARAM_ENC, strEncyValue);

        return strQueryString;
    }
}
