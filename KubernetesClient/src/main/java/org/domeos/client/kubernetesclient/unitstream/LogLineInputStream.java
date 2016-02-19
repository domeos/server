package org.domeos.client.kubernetesclient.unitstream;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Created by anningluo on 15-12-5.
 */
public class LogLineInputStream extends BasicUnitInputStream<String> {
    @Override
    protected String formatOutput(ByteArrayOutputStream stream) throws IOException {
        return stream.toString();
    }
}
