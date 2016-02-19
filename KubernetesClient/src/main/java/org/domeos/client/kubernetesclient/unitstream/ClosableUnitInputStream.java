package org.domeos.client.kubernetesclient.unitstream;

import java.io.IOException;
import java.io.InputStream;

/**
 * Created by anningluo on 15-12-3.
 */
public interface ClosableUnitInputStream<T> extends UnitInputStream<T> {
    public void init(InputStream input);
    public void close() throws IOException;
}
