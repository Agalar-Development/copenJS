package space.copenjs.gui;

import net.fabricmc.api.EnvType;
import net.fabricmc.api.Environment;
import net.minecraft.client.gui.DrawContext;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.screen.multiplayer.ConnectScreen;
import net.minecraft.client.gui.screen.multiplayer.MultiplayerScreen;
import net.minecraft.client.network.ServerAddress;
import net.minecraft.client.network.ServerInfo;
import net.minecraft.text.Text;
import net.minecraft.util.Identifier;
import org.slf4j.Logger;
import space.copenjs.copenJS;
import space.copenjs.helpers.DatabaseHelper;

@Environment(value= EnvType.CLIENT)
public class copenJSServerList extends Screen {
    private final Logger LOGGER = copenJS.LOGGER;
    private final MultiplayerScreen parent;
    public copenJSServerList(Screen parent) {
        super(Text.literal("copenJS Server List"));
        this.parent = (MultiplayerScreen) parent;
    }

    @Override
    protected void init() {
        copenJS.mc.getTextureManager().bindTexture(new Identifier("copenjs", "background.png"));
        copenJS.mc.getTextureManager().bindTexture(new Identifier("copenjs", "copenjs.png"));
      //  if (DatabaseHelper.isConnected) DatabaseHelper.fetchServers().forEach(server -> server.toJson());
    }

    @Override
    public void render(DrawContext context, int mouseX, int mouseY, float delta) {
        super.render(context, mouseX, mouseY, delta);
        context.drawTexture(new Identifier("copenjs:background.png"), 0, 0, 0.0f, 0.0f, this.width, this.height, this.width, this.height);
        context.drawCenteredTextWithShadow(textRenderer, Text.literal("copenJS"), width / 2, 10, 0xffffff);
        context.drawTexture(new Identifier("copenjs:copenjs.png"), (width / 2) - 32 , 30, 0.0f, 0.0f, 64, 64, 64, 64);
        if (!DatabaseHelper.isConnected) {
            context.drawCenteredTextWithShadow(textRenderer, Text.literal("An error happened while connecting to the database."), width / 2, 30, 0xA10000);
        }
    }

    public void renderServer(DrawContext context, int mouseX, int mouseY, float delta) {

    }

    private void connect(String ip) {
       ServerInfo entry = new ServerInfo("", ip, ServerInfo.ServerType.OTHER);
       ConnectScreen.connect(this, this.client, ServerAddress.parse(entry.address), entry, false);
    }

    @Override
    public void close() {
        client.setScreen(parent);
    }
}
