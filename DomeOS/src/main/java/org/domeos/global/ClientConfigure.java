package org.domeos.global;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ClientConfigure {
    /* The default timeout for http connect. */
    public static final int DEFAULT_TIMEOUT = 30 * 1000;

    /* The default maximum number of retries for error responses. */

    private int timeout = DEFAULT_TIMEOUT;

    public int getTimeout() {
        return timeout;
    }

    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }

    public static final int THREAD_NUMBER = 50;

    public static ExecutorService executorService = Executors.newFixedThreadPool(THREAD_NUMBER);
}
