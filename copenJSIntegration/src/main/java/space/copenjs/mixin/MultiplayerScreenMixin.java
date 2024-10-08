package space.copenjs.mixin;

import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.screen.multiplayer.MultiplayerScreen;
import net.minecraft.client.gui.tooltip.Tooltip;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.text.Text;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import space.copenjs.gui.copenJSServerList;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;

@Mixin(MultiplayerScreen.class)
public abstract class MultiplayerScreenMixin extends Screen {
	protected MultiplayerScreenMixin(Text title) {
		super(title);
	}
	public ButtonWidget copenJSButton = new ButtonWidget.Builder(Text.literal("copenJS"), button -> {
		client.setScreen(new copenJSServerList(client.currentScreen));
	})
			.position(10, 7)
			.size(60, 20)
			.tooltip(Tooltip.of(Text.literal("Opens copenJS GUI")))
			.build();

	@Inject(at = @At("TAIL"), method = "init")
	private void init(CallbackInfo info) {
		addDrawableChild(copenJSButton);
	}
}