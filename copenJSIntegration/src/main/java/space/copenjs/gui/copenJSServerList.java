package space.copenjs.gui;

import net.fabricmc.api.EnvType;
import net.fabricmc.api.Environment;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.text.Text;
import org.slf4j.Logger;
import space.copenjs.copenJS;

@Environment(value= EnvType.CLIENT)
public class copenJSServerList extends Screen {
    private final Logger LOGGER = copenJS.LOGGER;
    private final Screen parent;
    protected copenJSServerList(Screen parent) {
        super(Text.literal("copenJS Server List"));
        this.parent = parent;
    }
}
