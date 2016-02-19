package org.domeos.client.kubernetesclient.unitstream.factory;

import org.domeos.client.kubernetesclient.unitstream.ClosableUnitInputStream;

/**
 * Created by anningluo on 15-12-5.
 */
public interface ClosableUnitInputStreamFactory<T> {
    public ClosableUnitInputStream<T> createUnitInputStream();
}
