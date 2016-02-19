package org.domeos.client.kubernetesclient.util.streambinder;

import org.apache.http.client.ClientProtocolException;
import org.domeos.client.kubernetesclient.definitions.unversioned.Status;
import org.domeos.client.kubernetesclient.unitstream.UnitInputStream;
import org.domeos.client.kubernetesclient.responsehandler.UnitInputStreamResponseHandler;

import java.io.IOException;
import java.util.Random;
import java.util.concurrent.*;

/**
 * Created by anningluo on 15-12-6.
 */
public class StreamBinder {
    private static Random random = new Random();
    private static ExecutorService executor = Executors.newCachedThreadPool();
    private long binderId = getBinderId();
    private int streamCount = 0;
    private LinkedBlockingQueue<Unit> queue = new LinkedBlockingQueue<>();
    // private List<StreamId> streamIdList = new LinkedList<>();

    public <T> StreamId<T> bind(UnitInputStreamProvider<T> provider) {
        RunnableStreamProvider runnableProvider = new RunnableStreamProvider(provider);
        Future<?> future = executor.submit(runnableProvider);
        Status result;
        synchronized (runnableProvider) {
            try {
                runnableProvider.wait();
                result = runnableProvider.getResponseStatus();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        return null;
    }
    public Unit take() throws InterruptedException {
        return queue.take();
    }
    public Unit poll() {
        return queue.poll();
    }
    public Unit poll(long millionSecond) throws InterruptedException {
        return queue.poll(millionSecond, TimeUnit.MILLISECONDS);
    }
    private long getBinderId() {
        return random.nextLong() & 0xFFFFFFFF00000000L;
    }
    public void close() {

    }

    class LocalUnitInputStreamResponseHandler<T> implements UnitInputStreamResponseHandler<T> {
        @Override
        public void handleResponse(UnitInputStream<T> input) throws ClientProtocolException, IOException {
            queue.offer(new Unit());
        }
    }
    class RunnableStreamProvider<T> implements Runnable {
        private final UnitInputStreamProvider<T> provider;
        private Status responseStatus = null;
        public RunnableStreamProvider(UnitInputStreamProvider<T> provider) {
            this.provider = provider;
        }
        @Override
        public void run() {
            provider.provideStream(new LocalUnitInputStreamResponseHandler<T>());
        }

        public Status getResponseStatus() {
            return responseStatus;
        }
    }
}
