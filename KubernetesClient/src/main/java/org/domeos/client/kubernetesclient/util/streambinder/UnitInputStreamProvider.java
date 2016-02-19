package org.domeos.client.kubernetesclient.util.streambinder;

import org.domeos.client.kubernetesclient.responsehandler.UnitInputStreamResponseHandler;

/**
 * Created by anningluo on 15-12-6.
 */
public interface UnitInputStreamProvider<T> {
    void provideStream(UnitInputStreamResponseHandler<T> handler);
}
