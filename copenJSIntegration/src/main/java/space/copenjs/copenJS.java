package space.copenjs;

import net.fabricmc.api.ModInitializer;
import net.minecraft.client.MinecraftClient;
import space.copenjs.helpers.DatabaseHelper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class copenJS implements ModInitializer {
	public static final String MOD_ID = "copenJS";
	public static MinecraftClient mc;
	public static final Double MOD_Version = 0.1;
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

	@Override
	public void onInitialize() {;
		DatabaseHelper.connectDatabase();
		mc = MinecraftClient.getInstance();
		LOGGER.info("copenJS is starting...");
	}
}