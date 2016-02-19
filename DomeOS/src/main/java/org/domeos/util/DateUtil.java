package org.domeos.util;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by zhenfengchen on 15-11-16.
 */
public class DateUtil {
    private static SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    public static String getDatetime(Date date) {
        return simpleDateFormat.format(date);
    }

    public static Date parseDateTime(String dateStr) {
        try {
            return simpleDateFormat.parse(dateStr);
        } catch (Exception e) {
            return new Date();
        }
    }
}
