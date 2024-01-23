package space.copenjs.helpers;

import space.copenjs.copenJS;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class NetworkHelper extends copenJS {
    private final static HttpClient client = HttpClient.newHttpClient();
    private static HttpRequest request(String url) {
        return HttpRequest.newBuilder(
                        URI.create(url))
                .header("User-Agent", "copenJSAgent/0.1")
                .build();
    }
    public static String fetchDatabase(String url) {
        try {
            HttpResponse<String> response = client.send(request(url), HttpResponse.BodyHandlers.ofString());
            LOGGER.debug("Request successful.");
            return String.valueOf(response.body());
        }
        catch (Exception e) {
            LOGGER.warn(String.valueOf(e));
            LOGGER.warn("An error occurred while fetching the database string.");
            return null;
        }
    }
}
