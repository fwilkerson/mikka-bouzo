export default (config, env, helpers) => {
	// add a PRERENDER global:
	helpers.getPluginsByName(
		config,
		'DefinePlugin'
	)[0].plugin.definitions.PRERENDER = String(env.ssr === true);
};
