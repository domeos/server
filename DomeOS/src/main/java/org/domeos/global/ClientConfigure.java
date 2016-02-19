package org.domeos.global;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ClientConfigure {
    public static int DEFAULT_TOTAL_CONNECTION = 1000;
    public static int DEFAULT_MAX_CONNECTIONS_PER_ROUTE = 500;

    /* The default timeout for http connect. */
    public static final int DEFAULT_TIMEOUT = 30 * 1000;

    /* The default maximum number of retries for error responses. */
    public static final int DEFAULT_MAX_RETRIES = 3;

    /* The version of SDK. */
    public static final String VERSION = "1.0.2";

    public static final int IdleConnectionTimeout = 30;

    public static final int initialDelay = 5;

    public static final int heartbeatPeriod = 10;

    private int timeout = DEFAULT_TIMEOUT;

    private int maxRetries = DEFAULT_MAX_RETRIES;

    private static String requestHost = "";

    public int getTimeout() {
        return timeout;
    }

    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }

    public int getMaxRetries() {
        return maxRetries;
    }

    public void setMaxRetries(int maxRetries) {
        this.maxRetries = maxRetries;
    }
    public static void setRequestHost(String reqHost)
    {
        requestHost = reqHost;
    }

    public static String getRequestHost()
    {
        return requestHost;
    }

    public static ExecutorService executorService = Executors.newFixedThreadPool(50);
}
