import {
	type MoveRegionFormData,
	type NSScript,
	type ValidRegionTag,
	canonicalize,
	prettify,
} from "../../../nsdotjs";

/**
 * Attempts to move the current nation to a different region.
 * @param context The NSScript instance
 * @param regionName The name of the region to move to.
 * @param password Optional password for the region.
 * @returns A Promise that resolves to true if the move is successful, false otherwise.
 */
export async function handleMove(
	context: NSScript,
	regionName: string,
	password?: string,
): Promise<boolean> {
	const payload: MoveRegionFormData = {
		region_name: regionName,
		move_region: "1",
	};
	if (password) {
		payload.password = password;
	}
	const text = await context.getNsHtmlPage("page=change_region", payload);
	if (text.includes("Success!")) {
		context.statusBubble.success(`Moved to region: ${prettify(regionName)}`);
		return true;
	}
	context.statusBubble.warn(
		`Failed to move to region: ${prettify(regionName)}`,
	);
	return false;
}

/**
 * Attempts to create a new region.
 * @param context The NSScript instance
 * @param regionName The name of the region to create.
 * @param wfe The World Factbook Entry for the region.
 * @param password Optional password for the region.
 * @param frontier Whether the region is a frontier region. Optional, defaults to false.
 * @param executiveDelegate Whether the region has an executive delegate. Optional, defaults to false.
 * @returns A Promise that resolves to true if the creation is successful, false otherwise.
 */
export async function handleCreate(
	context: NSScript,
	regionName: string,
	wfe: string,
	password = "",
	frontier = false,
	executiveDelegate = false,
): Promise<boolean> {
	const payload: Record<string, string> = {
		region_name: canonicalize(regionName),
		desc: wfe,
		create_region: "1",
		is_frontier: frontier ? "1" : "0",
		delegate_control: executiveDelegate ? "1" : "0",
	};
	if (password) {
		payload.pw = "1";
		payload.rpassword = password;
	}
	const text = await context.getNsHtmlPage("page=create_region", payload);
	if (text.includes("Success! You have founded ")) {
		context.statusBubble.success(`Created region: ${prettify(regionName)}`);
		return true;
	}
	context.statusBubble.warn(`Failed to create region: ${prettify(regionName)}`);
	return false;
}

export async function handleChangeWFE(context: NSScript, wfe: string) {
	const text = await context.getNsHtmlPage("page=region_control", {
		message: wfe.trim(),
		setwfebutton: "1",
	});
	if (text.includes("World Factbook Entry updated!")) {
		context.statusBubble.success("World Factbook Entry updated!");
		return true;
	}
	context.statusBubble.warn("Failed to update World Factbook Entry.");
	return false;
}

export async function handleRequestEmbassy(context: NSScript, target: string) {
	const text = await context.getNsHtmlPage("page=region_control", {
		requestembassyregion: target,
		requestembassy: "1",
	});
	if (text.includes("Your proposal for the construction of embassies with")) {
		context.statusBubble.success(`Requested embassy with ${prettify(target)}`);
		return true;
	}
	context.statusBubble.warn(
		`Failed to request embassy with ${prettify(target)}`,
	);
	return false;
}

export async function handleCloseEmbassy(context: NSScript, target: string) {
	const text = await context.getNsHtmlPage("page=region_control", {
		cancelembassyregion: target,
	});
	if (text.includes(" has been scheduled for demolition.")) {
		context.statusBubble.success(`Burned embassy with ${prettify(target)}`);
		return true;
	}
	context.statusBubble.warn(`Failed to burn embassy with ${prettify(target)}`);
	return false;
}

export async function handleAbortEmbassy(context: NSScript, target: string) {
	const text = await context.getNsHtmlPage("page=region_control", {
		abortembassyregion: target,
	});
	if (text.includes(" aborted.")) {
		context.statusBubble.success(`Aborted embassy with ${prettify(target)}`);
		return true;
	}
	context.statusBubble.warn(`Failed to abort embassy with ${prettify(target)}`);
	return false;
}

export async function handleCancelEmbassyClosure(
	context: NSScript,
	target: string,
) {
	const text = await context.getNsHtmlPage("page=region_control", {
		cancelembassyclosureregion: target,
	});
	if (text.includes("Embassy closure order cancelled.")) {
		context.statusBubble.success(
			`Cancelled embassy closure with ${prettify(target)}`,
		);
		return true;
	}
	context.statusBubble.warn(
		`Failed to cancel embassy closure with ${prettify(target)}`,
	);
	return false;
}

export async function handleEject(
	context: NSScript,
	nationName: string,
): Promise<boolean> {
	const text = await context.getNsHtmlPage("page=region_control", {
		nation_name: nationName,
		eject: "1",
	});
	if (text.includes("has been ejected from ")) {
		context.statusBubble.success(`Ejected nation: ${prettify(nationName)}`);
		return true;
	}
	context.statusBubble.warn(`Failed to eject nation: ${prettify(nationName)}`);
	return false;
}

export async function handleBanject(
	context: NSScript,
	nationName: string,
): Promise<boolean> {
	const text = await context.getNsHtmlPage("page=region_control", {
		nation_name: nationName,
		ban: "1",
	});
	if (text.includes("has been ejected and banned from ")) {
		context.statusBubble.success(`Banjected nation: ${prettify(nationName)}`);
		return true;
	}
	context.statusBubble.warn(
		`Failed to banject nation: ${prettify(nationName)}`,
	);
	return false;
}

export async function handleTag(
	context: NSScript,
	action: "add" | "remove",
	tag: ValidRegionTag,
): Promise<boolean> {
	let prettified_action = "";
	switch (action) {
		case "add":
			prettified_action = "Add";
			break;
		case "remove":
			prettified_action = "Remov"; // lol
			break;
	}
	// payload consisting of f'{action}_tag': tag and "updatetagsbutton": "1"
	const payload = {
		[`${action}_tag`]: tag,
		updatetagsbutton: "1",
	};
	const text = await context.getNsHtmlPage("page=region_control", payload);
	if (text.includes("Region Tags updated!")) {
		context.statusBubble.success(
			`${prettified_action}ed tag: ${prettify(tag)}`,
		);
		return true;
	}
	if (prettified_action === "Remov") {
		prettified_action = "Remove";
	}
	context.statusBubble.warn(
		`Failed to ${prettified_action.toLowerCase()} tag: ${prettify(tag)}`,
	);
	return false;
}

export async function handleEditRO(
	context: NSScript,
	nationName: string,
	officeName: string,
	authority: string,
	regionName?: string,
): Promise<boolean> {
	const payload: Record<string, string> = {
		nation: nationName,
		office_name: officeName,
		editofficer: "1",
	};

	if(authority.includes("A")) payload.authority_A = "on";
	if(authority.includes("B")) payload.authority_B = "on";
	if(authority.includes("C")) payload.authority_C = "on";
	if(authority.includes("E")) payload.authority_E = "on";
	if(authority.includes("P")) payload.authority_P = "on";
	if(authority.includes("S")) payload.authority_S = "on";

	let page = "page=region_control";
	if(regionName) {
		page += `/region=${regionName}`;
		payload.region = regionName;
	}

	const text = await context.getNsHtmlPage(page, payload);
	if(text.includes("Appointed") && text.includes("with authority over")) {
		context.statusBubble.success(`Appointed ${prettify(nationName)} as RO`);
		return true;
	}
	if (text.includes("Renamed the authority held by") 
		|| ((text.includes("authority from") || text.includes("authority to")) 
		&& (text.includes("Removed") || text.includes("Granted")))) {
		context.statusBubble.success(`Edited ${prettify(nationName)}'s office`);
		return true;
	}
	context.statusBubble.warn(
		`Failed to appoint/edit ${prettify(nationName)} as RO`,
	);
	return false;
}

export async function handleDismissRO(
	context: NSScript,
	nationName: string,
	regionName?: string,
): Promise<boolean> {
	const payload: Record<string, string> = {
		nation: nationName,
		abolishofficer: "1",
	};

	let page = "page=region_control";
	if(regionName) {
		page += `/region=${regionName}`;
		payload.region = regionName;
	}

	const text = await context.getNsHtmlPage(page, payload);
	if(text.includes("Dismissed") && text.includes("as")) {
		context.statusBubble.success(`Dismissed ${prettify(nationName)} from office`);
		return true;
	}
	context.statusBubble.warn(
		`Failed to dismiss ${prettify(nationName)} from office`,
	);
	return false;
}

export async function handleEditDelegate(
	context: NSScript,
	authority: string,
	regionName?: string,
): Promise<boolean> {
	const payload: Record<string, string> = {
		office: "delegate",
		editofficer: "1",
		authority_W: "on", // world assembly authority always on
	};

	if(authority.includes("A")) payload.authority_A = "on";
	if(authority.includes("B")) payload.authority_B = "on";
	if(authority.includes("C")) payload.authority_C = "on";
	if(authority.includes("E")) payload.authority_E = "on";
	if(authority.includes("P")) payload.authority_P = "on";
	if(authority.includes("X")) payload.authority_X = "on";

	let page = "page=region_control";
	if(regionName) {
		page += `/region=${regionName}`;
		payload.region = regionName;
	}

	const text = await context.getNsHtmlPage(page, payload);
	if (text.includes("Set Delegate authority to:")) {
		context.statusBubble.success("Modified delegate authority");
		return true;
	}
	context.statusBubble.warn(
		"Failed to modify delegate authority",
	);
	return false;
}

export async function handleRenameGovernor(
	context: NSScript,
	officeName: string,
	regionName?: string,
): Promise<boolean> {
	const payload: Record<string, string> = {
		office: "governor",
		office_name: officeName,
		editofficer: "1",
	};

	let page = "page=region_control";
	if(regionName) {
		page += `/region=${regionName}`;
		payload.region = regionName;
	}

	const text = await context.getNsHtmlPage(page, payload);
	if (text.includes("Renamed the Governor's office")) {
		context.statusBubble.success("Renamed Governor");
		return true;
	}
	context.statusBubble.warn(
		"Failed to rename Governor",
	);
	return false;
}

// TODO: uploading flags/banners, as well as detag wfe's from pauls website
