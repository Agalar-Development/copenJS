package space.copenjs.helpers;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

import net.fabricmc.loader.api.FabricLoader;
import org.apache.commons.codec.digest.DigestUtils;
import space.copenjs.copenJS;

public class FileHelper extends copenJS {
    public static String getHash() {
        try (InputStream is = Files.newInputStream(Paths.get(FabricLoader.getInstance().getGameDir().toAbsolutePath() + "/mods/copenjs-" + MOD_Version + ".jar"))) {
            return DigestUtils.md5Hex(is);
        }
        catch (Exception e) {
            return null;
        }
    }
}
