package com.stremiomagnetbridge.app;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class BencodeEncoder {
    public static byte[] encode(Object o) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        write(o, out);
        return out.toByteArray();
    }

    private static void write(Object o, ByteArrayOutputStream out) throws IOException {
        if (o instanceof String) {
            byte[] bytes = ((String) o).getBytes(StandardCharsets.UTF_8);
            out.write(String.valueOf(bytes.length).getBytes(StandardCharsets.US_ASCII));
            out.write(':');
            out.write(bytes);
        } else if (o instanceof byte[]) {
            byte[] bytes = (byte[]) o;
            out.write(String.valueOf(bytes.length).getBytes(StandardCharsets.US_ASCII));
            out.write(':');
            out.write(bytes);
        } else if (o instanceof Number) {
            out.write('i');
            out.write(String.valueOf(((Number) o).longValue()).getBytes(StandardCharsets.US_ASCII));
            out.write('e');
        } else if (o instanceof List) {
            out.write('l');
            for (Object item : (List<?>) o) {
                write(item, out);
            }
            out.write('e');
        } else if (o instanceof Map) {
            out.write('d');
            Map<?, ?> map = (Map<?, ?>) o;
            List<String> keys = new ArrayList<String>();
            for (Object k : map.keySet()) {
                keys.add(k.toString());
            }
            Collections.sort(keys);
            for (String key : keys) {
                write(key, out);
                write(map.get(key), out);
            }
            out.write('e');
        }
    }
}
