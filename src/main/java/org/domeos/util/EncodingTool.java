package org.domeos.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.UnsupportedEncodingException;

/**
 * Created by baokangwang on 2016/5/6.
 */
public class EncodingTool {
    private static Logger logger = LoggerFactory.getLogger(EncodingTool.class);

    public static String encodeStr(String str) {
        try {
            return new String(str.getBytes("ISO-8859-1"), "UTF-8");
        } catch (UnsupportedEncodingException e) {
            logger.error("encode alarm error, message is " + e.getMessage());
            return null;
        }
    }

    public static String getMailSender(String sender) {
        if (StringUtils.isBlank(sender)) {
            sender = "groovy/DefaultMailSender.groovy";
        } else {
            if (!sender.contains("groovy/")) {
                sender = "groovy/" + sender;
            }
            if (!sender.endsWith(".groovy") && sender.contains(".")) {
                sender = sender + ".groovy";
            }
        }
        return sender;
    }

    public static String getSMSSender(String sender) {
        if (StringUtils.isBlank(sender)) {
            sender = "groovy/DefaultSMSSender.groovy";
        } else {
            if (!sender.contains("groovy/")) {
                sender = "groovy/" + sender;
            }
            if (!sender.endsWith(".groovy") && sender.contains(".")) {
                sender = sender + ".groovy";
            }
        }
        return sender;
    }

    public static String getWechatSender(String sender) {
        if (StringUtils.isBlank(sender)) {
            sender = "groovy/DefaultWechatSender.groovy";
        } else {
            if (!sender.contains("groovy/")) {
                sender = "groovy/" + sender;
            }
            if (!sender.endsWith(".groovy") && sender.contains(".")) {
                sender = sender + ".groovy";
            }
        }
        return sender;
    }
}