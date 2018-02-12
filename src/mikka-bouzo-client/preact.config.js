export default (config, env, helpers) => {
	// Add a PRERENDER global:
	helpers.getPluginsByName(
		config,
		'DefinePlugin'
	)[0].plugin.definitions.PRERENDER = String(env.ssr === true);
};
