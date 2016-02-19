package org.domeos.client.kubernetesclient.responsehandler;

import org.domeos.client.kubernetesclient.unitstream.ClosableUnitInputStream;

/**
 * Created by anningluo on 15-12-4.
 */
public abstract class BasicStreamResponseHandler<T> implements UnitInputStreamResponseHandler<T> {
    public abstract ClosableUnitInputStream<T> createUnitInputStream();
}
