package org.domeos.global;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

public class ClientConfigure {
    private static Logger logger = LoggerFactory.getLogger(ClientConfigure.class);

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

    public static <V, T extends Callable<V>> List<V> executeCompletionService(List<T> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return new ArrayList<>(1);
        }

        List<V> result = new ArrayList<>(tasks.size());
        CompletionService<V> completionService = new ExecutorCompletionService<>(executorService);

        for (T task : tasks) {
            completionService.submit(task);
        }
        for (int index = 0; index < tasks.size(); index++) {
            try {
                V res = completionService.take().get();
                if (res != null) {
                    result.add(res);
                }
            } catch (InterruptedException |ExecutionException e) {
                logger.warn("execute completion service error, message is " + e.getMessage());
            }
        }
        return result;
    }

    public static <T extends Runnable> void executeRunnableCompletionService(List<T> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return;
        }
        CompletionService<Integer> completionService = new ExecutorCompletionService<>(executorService);

        for (T task : tasks) {
            completionService.submit(task, 1);
        }

        for (int index = 0; index < tasks.size(); index++) {
            try {
                completionService.take().get();
            } catch (InterruptedException |ExecutionException e) {
                logger.warn("execute completion service error, message is " + e.getMessage());
            }
        }
    }
}
