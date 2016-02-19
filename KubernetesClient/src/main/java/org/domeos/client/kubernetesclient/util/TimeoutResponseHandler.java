package org.domeos.client.kubernetesclient.util;

import org.apache.http.client.ClientProtocolException;
import org.domeos.client.kubernetesclient.responsehandler.UnitInputStreamResponseHandler;
import org.domeos.client.kubernetesclient.unitstream.UnitInputStream;

import java.io.IOException;
import java.util.concurrent.*;

/**
 * Created by anningluo on 15-12-6.
 */
public abstract class TimeoutResponseHandler<T> implements UnitInputStreamResponseHandler<T> {
    private static ExecutorService executor = Executors.newCachedThreadPool();
    private UnitInputStream<T> input;
    protected int maxRetryTimes = 10;
    @Override
    public void handleResponse(UnitInputStream<T> input) throws ClientProtocolException, IOException {
        if (input == null) {
            handleNotFound();
            return;
        }
        this.input = input;
        boolean isContinue = true;
        int retryTimes = maxRetryTimes;
        Future<T> future = null;
        Throwable cause = null;
        while (retryTimes > 0) {
            if (future == null) {
                future = executor.submit(new ReadUnitTask());
            }
            try {
                long timeout = getTimeout();
                T unit = null;
                if (timeout < 0) {
                    unit = future.get();
                } else {
                    unit = future.get(getTimeout(), TimeUnit.MILLISECONDS);
                }
                if (unit == null) {
                    break;
                }
                isContinue = handleResponse(unit);
                retryTimes = maxRetryTimes;
                future = null;
            } catch (InterruptedException e) {
                retryTimes--;
                future = null;
                cause = e.getCause();
            } catch (ExecutionException e) {
                retryTimes--;
                future = null;
                cause = e.getCause();
            } catch (TimeoutException e) {
                isContinue = handleTimeout();
            } catch (Exception e) {
                future.cancel(true);
                handleFailed();
                throw e;
            }
            if (!isContinue) {
                if (future != null) {
                    future.cancel(true);
                }
                break;
            }
        }
        if (retryTimes <= 0) {
            handleFailed();
            throw new IOException(cause);
        }
        handleNomalOver();
    }
    // this function return timeout between every time response in millionsecond.
    // It will be called everytime before call handleResponse
    // and read unit with blocking no more than getTimeout() millionsecond.
    // If a unit is returned before timeout, handleResponse will be called,
    // or handleTimeout will be called.
    // If getTimeout() < 0 it will block until one unit would has been read from
    // the stream
    public long getTimeout() { return -1;}  // in millionsecond
    // handleResponse will be called when read one unit
    // if return true, it will try get next unit
    // if return false, it will over the handler
    public abstract boolean handleResponse(T unit) throws IOException, ClientProtocolException;
    // handleTimeout will be called when timeout occur,
    // if return true, it will try get next unit
    // if return false, it will over the handler
    public boolean handleTimeout() throws IOException, ClientProtocolException {return false;}
    // call if resource is not found
    public void handleNotFound() throws IOException, ClientProtocolException {return;}
    // call if success terminate
    public void handleNomalOver() throws IOException, ClientProtocolException {return;}
    // call before throw one exception
    public void handleFailed() {return;}

    class ReadUnitTask implements Callable<T> {
        @Override
        public T call() throws Exception {
            return input.read();
        }
    }
}

