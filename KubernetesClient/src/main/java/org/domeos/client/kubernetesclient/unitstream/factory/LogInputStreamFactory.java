package org.domeos.client.kubernetesclient.unitstream.factory;

import org.domeos.client.kubernetesclient.unitstream.BasicUnitInputStream;
import org.domeos.client.kubernetesclient.unitstream.ClosableUnitInputStream;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Created by anningluo on 15-12-4.
 */
public class LogInputStreamFactory implements ClosableUnitInputStreamFactory<String> {
    public ClosableUnitInputStream<String> createUnitInputStream() {
        return new BasicUnitInputStream<String>() {
            @Override
            protected String formatOutput(ByteArrayOutputStream stream) throws IOException {
                return stream.toString();
            }
        };
    }
}
