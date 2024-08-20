package space.copenjs;

import net.fabricmc.api.ModInitializer;
import net.minecraft.client.MinecraftClient;
import space.copenjs.helpers.DatabaseHelper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class copenJS implements ModInitializer {
	public static final String MOD_ID = BuildConfig.MOD_ID;
	public static MinecraftClient mc;
	public static final Double MOD_Version = BuildConfig.MOD_VERSION;
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);
	public static String build = BuildConfig.buildType;
	public static String bypassHash = BuildConfig.bypassHash;

	@Override
	public void onInitialize() {;
		LOGGER.info("Build Type: " + build + ((build == "dev") ? " Bypass Hash: " + bypassHash : ""));
		DatabaseHelper.connectDatabase();
		mc = MinecraftClient.getInstance();
		LOGGER.info("copenJS is starting...");
	}
}