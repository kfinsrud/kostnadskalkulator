export enum TreatmentType {
    PATCH_HARVEST = "PATCH_HARVEST",
    SINGLE_TREE_SELECTION = "SINGLE_TREE_SELECTION",
}

function trunk_rng( // Utydelig for meg hvor denne kommer fra?
    trunk: number,
    min: number,
    max: number
) {
    return Math.max(min, Math.min(max, trunk));
}

//TODO: Bruker nåværende formel m3fub for middelstamme, eller er det noe helt annet?
/*
m3sk Tree stem volume above the felling cut. Includes bark and top of the tree, but not branches.
m3fub Volume of log(s) excluding bark.
m3fpb Volume of log(s) including bark.
m3to Volume of log(s) as given by a cylinder, with diameter = top diameter of the log under bark.
 */


export function t_harv_ccf_fj94(
    stems_ha: number = 1200,
    v: number = 0.4,
    treatment: TreatmentType = TreatmentType.PATCH_HARVEST,
    harvest_strength_pct: number = 45, // share of basal area to be cut
    patch_size_ha: number = 0.6,
    sr_w: number = 4,
    stripRoadExists: boolean = true,
    slope: number = 1,
    surface: number = 1
) {
    let vharv = stems_ha * v * harvest_strength_pct / 100;

    if(treatment === TreatmentType.PATCH_HARVEST) {
        patch_size_ha = trunk_rng(patch_size_ha, 100/10000, 0.5);
        const ptch_w = Math.sqrt(patch_size_ha) * 100;
        console.log(patch_size_ha);
        console.log(ptch_w);
        const sr_sp =
            (
                Math.sqrt(
                    sr_w*sr_w
                    - 4 * sr_w* (harvest_strength_pct / 100) * ptch_w
                    + 4 * (harvest_strength_pct / 100) * (ptch_w*ptch_w)
                )
                + sr_w
            )
            /
            (2 * (harvest_strength_pct/100))

        console.log(sr_sp);

        const sr_share_harvest_area =
            (sr_sp - ptch_w) *
            sr_w / (harvest_strength_pct * sr_sp*sr_sp /100);
        // const sr_share_tot_area =
        //     (sr_sp * ptch_w) *
        //     sr_w / (sr_sp**2);

        const nharv_sr =
            stripRoadExists? 0 : sr_share_harvest_area * stems_ha;
        const vharv_sr = nharv_sr * v;
        const v_sr =
            stripRoadExists? 0 : vharv_sr / nharv_sr;

        const vharv_bsr =
            vharv - vharv_sr;
        const v_bsr = v;
        const nharv_bsr = vharv_bsr / v_bsr;
        const nharv = nharv_bsr + nharv_sr;
        console.log({
            sr_share_harvest_area: sr_share_harvest_area,
            v_sr: v_sr,
            nharv_sr: nharv_sr,
            vharv_bsr: vharv_bsr,
            vharv_sr: vharv_sr,
            v_bsr: v_bsr,
        })

        return getHarvestTime(
            v_bsr, // v_bsr alltid lik v?
            harvest_strength_pct,
            vharv,
            vharv_sr,
            vharv_bsr,
            v,
            v_sr,
            treatment,
            stripRoadExists,
            nharv,
            slope,
            surface
        )

    } else {
        const sr_sp = 22;
        const sr_share_harvest_area = sr_w / sr_sp;

        stripRoadExists = false;

        // const sr_share_tot_area = sr_share_harvest_area; // ser ikke ut til å bli brukt
        const nharv_sr = stems_ha * sr_share_harvest_area;
        const v_sr = stripRoadExists? 0:v;
        const vharv_sr = stems_ha * sr_share_harvest_area * v_sr;

        const vharv_bsr = vharv - vharv_sr;
        const v_bsr = v * 1.3; // selektivt valg av trær 30% over snitt av v
        const nharv_bsr = vharv_bsr / v_bsr;
        const nharv = parseInt((nharv_bsr + nharv_sr).toString());
        vharv = vharv_sr + vharv_bsr;
        // const v_hrv = parseFloat((vharv * nharv).toFixed(3));

        console.log({
            sr_share_harvest_area: sr_share_harvest_area,
            nharv_sr: nharv_sr,
            nharv_bsr: nharv_bsr,
            v_sr: v_sr,
            vharv_bsr: vharv_bsr,
            vharv_sr: vharv_sr,
            v_bsr: v_bsr,
            vharv: vharv
        })
         return getHarvestTime(
            v_bsr,
            harvest_strength_pct,
            vharv,
            vharv_sr,
            vharv_bsr,
            v,
            v_sr,
            treatment,
            stripRoadExists,
             nharv,
             slope,
             surface
        )
    }
}

function getHarvestTime(
    v_bsr: number,
    harvest_strength_pct: number,
    vharv: number,
    vharv_sr: number,
    vharv_bsr: number,
    v: number,
    v_sr: number,
    type: TreatmentType,
    stripRoadExists: boolean,
    nharv: number,
    slope: number,
    surface: number
) {
    const sf_factor = type===TreatmentType.PATCH_HARVEST? 1 : 2;
    const newFactor = 1 + (50/nharv) - 0.1 * surface - 0.1 * slope;
    console.log("sf_factor",sf_factor);
    const T_proc_cmin_m3 = 81.537 + (29.4662 / v_bsr) + 31.12 * sf_factor;
    const T_move_cmin_m3 = 5.756 + (539.574 / (v_bsr * harvest_strength_pct * newFactor));
    const T_clpr_cmin_m3 = 15.84;
    const T_bsr_cmin_m3 = (T_proc_cmin_m3 + T_move_cmin_m3 + T_clpr_cmin_m3);
    const T_bsr_cmin_ha = T_bsr_cmin_m3 * vharv_bsr;
    let T_sr_cmin_m3 = stripRoadExists? 0 : 1;
    if(type === TreatmentType.PATCH_HARVEST) {
        T_sr_cmin_m3 *=  stripRoadExists? 0 : 81.537 + (29.4662/v_sr)  + 31.12 * 1.5 + 23.9 / (v_sr * newFactor) + 15.84;
    } else {
        T_sr_cmin_m3 *=  stripRoadExists? 0 : 81.537 + (29.4662/v_sr)  + 31.12 * sf_factor + 5.756 + 539.574 / (v_sr * harvest_strength_pct * newFactor) + 15.84;
    }
    const T_sr_cmin_ha = stripRoadExists? 0 : T_sr_cmin_m3 * vharv_sr;
    const T_cmin_ha = T_sr_cmin_ha + T_bsr_cmin_ha;
    const T_mean_cmin_m3 = T_cmin_ha/vharv;


    const cmin_tree = T_mean_cmin_m3 * v;
    const harv_G15min_ha = T_cmin_ha * 1.5 / 100;
    const harv_G15h_ha = harv_G15min_ha / 60;
    const harv_G15min_m3 = harv_G15min_ha / vharv;
    const harv_m3_g15h = 60 / harv_G15min_m3;
    console.log({
        T_proc_cmin_m3: T_proc_cmin_m3,
        T_move_cmin_m3: T_move_cmin_m3,
        T_clpr_cmin_m3: T_clpr_cmin_m3,
        T_bsr_cmin_m3: T_bsr_cmin_m3,
        T_bsr_cmin_ha: T_bsr_cmin_ha,
        T_sr_cmin_m3: T_sr_cmin_m3,
        T_sr_cmin_ha: T_sr_cmin_ha,
        T_cmin_ha: T_cmin_ha,
        T_mean_cmin_m3: T_mean_cmin_m3,
        cmin_tree: cmin_tree,
        harv_G15min_ha: harv_G15min_ha,
        harv_G15h_ha: harv_G15h_ha,
        harv_G15min_m3: harv_G15min_m3,
        harv_m3_g15h: harv_m3_g15h
    });
    return harv_m3_g15h;
}


export function patchHarvest(
    stemsPerHectare: number = 1200,
    meanTreeVolumeM3fub: number = 0.4, // m^3fub = mean tree volume excluding bark. Tror dette er middelstamme eller en variant av det.
    harvestStrengthPercent: number = 45, // share of basal area to be cut
    harvestedPatchSizeInHectare: number = 0.6,
    stripRoadWidthMeters: number = 4,
    stripRoadExists: boolean = true
) {

    let volumeHarvestedPerHectare = stemsPerHectare * meanTreeVolumeM3fub * (harvestStrengthPercent / 100);

    console.log(volumeHarvestedPerHectare);
    harvestedPatchSizeInHectare = trunk_rng(harvestedPatchSizeInHectare, 100/10000, 0.5);
    const patchEdgeLengthInMeters = Math.sqrt(harvestedPatchSizeInHectare) * 100;

    console.log(harvestedPatchSizeInHectare);

    console.log(patchEdgeLengthInMeters);

    const a = stripRoadWidthMeters^2;
    console.log("a", a);
    const b = 4 * stripRoadWidthMeters * (harvestStrengthPercent/100) * patchEdgeLengthInMeters;
    console.log("b", b);


    const c = 4 * (harvestStrengthPercent/100) * patchEdgeLengthInMeters^2;
    console.log("c", c);
    const stripRoadSpacing =
        (Math.sqrt( a - b + c) + stripRoadWidthMeters) /
        (2 * (harvestStrengthPercent/100))

    console.log(stripRoadSpacing);

    const stripRoadAreaFractionPerPatch =
        (stripRoadSpacing * patchEdgeLengthInMeters) *
        stripRoadWidthMeters / (harvestStrengthPercent * stripRoadSpacing**2 /100);

    console.log(stripRoadAreaFractionPerPatch);

    const stripRoadStemCount =
        stripRoadExists? 0 : stripRoadAreaFractionPerPatch * stemsPerHectare;

    console.log(stripRoadStemCount);

    const volumeHarvestedPerHectareOnStripRoad = stripRoadStemCount * meanTreeVolumeM3fub;

    console.log(volumeHarvestedPerHectareOnStripRoad);

    const v_sr =
        stripRoadExists? 0 : volumeHarvestedPerHectareOnStripRoad / stripRoadStemCount;

    console.log(v_sr);

    const volumeHarvestedPrHectareBetweenStripRoads =
        volumeHarvestedPerHectare - volumeHarvestedPerHectareOnStripRoad;

    return getHarvestTimePerG15H(
        meanTreeVolumeM3fub,
        harvestStrengthPercent,
        volumeHarvestedPerHectare,
        volumeHarvestedPerHectareOnStripRoad,
        volumeHarvestedPrHectareBetweenStripRoads,
        meanTreeVolumeM3fub,
        v_sr,
        TreatmentType.PATCH_HARVEST,
        stripRoadExists
    )
}





export function selectionHarvest(
    stemsPerHectare: number = 1200,
    meanTreeVolumeM3fub: number = 0.4, // m^3fub = mean tree volume excluding bark. Tror dette er middelstamme eller en variant av det.
    harvestStrengthPercent: number = 45, // share of basal area to be cut
    harvestedPatchSizeInHectare: number = 0.6,
    stripRoadWidthMeters: number = 4,
    stripRoadExists: boolean = true
) {
    let volumeHarvestedPerHectare = stemsPerHectare * meanTreeVolumeM3fub * harvestStrengthPercent / 100;
    const stripRoadSpacing = 22;
    const sr_share_harvest_area = stripRoadWidthMeters / stripRoadSpacing;

    stripRoadExists = false;

    const volumeStripRoad = meanTreeVolumeM3fub;
    const volumeHarvestedPerHectareOnStripRoad = stemsPerHectare * sr_share_harvest_area * volumeStripRoad;
    const volumeHarvestedPerHectareBetweenStripRoads = volumeHarvestedPerHectare - volumeHarvestedPerHectareOnStripRoad;
    const volumeBetweenStripRoads = meanTreeVolumeM3fub * 1.3;
    volumeHarvestedPerHectare = volumeHarvestedPerHectareOnStripRoad * volumeHarvestedPerHectareBetweenStripRoads;

    return getHarvestTimePerG15H(
        volumeBetweenStripRoads,
        harvestStrengthPercent,
        volumeHarvestedPerHectare,
        volumeHarvestedPerHectareOnStripRoad,
        volumeHarvestedPerHectareBetweenStripRoads,
        meanTreeVolumeM3fub,
        volumeStripRoad,
        TreatmentType.SINGLE_TREE_SELECTION,
        stripRoadExists
    )
}


export function getHarvestTimePerG15H(
    volumeBetweenStripRoads: number,
    harvestStrengthPercentage: number,
    volumeHarvestedPrHectare: number,
    volumeHarvestedPrHectareOnStripRoad: number,
    volumeHarvestedPrHectareBetweenStripRoads: number,
    meanTreeVolumem3fub: number,
    stripRoadVolume: number,
    type: TreatmentType,
    stripRoadAlreadyExists: boolean
) {
    let centiMinSpentPrHectare = centiMinSpentPrHectareBetweenStripRoad(
        volumeBetweenStripRoads,
        type,
        harvestStrengthPercentage,
        volumeHarvestedPrHectareBetweenStripRoads
    )
    if(!stripRoadAlreadyExists) {
        centiMinSpentPrHectare += centiMinSpentPrHectareOnStripRoads(
            stripRoadVolume,
            volumeHarvestedPrHectareOnStripRoad
        );
    }

    const g15MinPrHectare = centiMinSpentPrHectare * 1.5 / 100;
    const volumeHarvestedPrG15min = g15MinPrHectare / volumeHarvestedPrHectare;
    return 60 / volumeHarvestedPrG15min;
}


export function centiMinSpentPrHectareBetweenStripRoad(
    volumeBetweenStripRoads: number,
    type: TreatmentType,
    harvestStrengthPercentage: number,
    volumeHarvestedPrHectareBetweenStripRoads: number,
) {
    const timeProcessingInCentiMinPrM3 = 81.537 / (29.4662 / volumeBetweenStripRoads) + 31.12 * ((type === TreatmentType.PATCH_HARVEST)? 1 : 2);
    const timeMovingInCentiMinPrM3 = 5.756 + (539.574 / (volumeBetweenStripRoads * harvestStrengthPercentage));
    const timeSpentClearingAndPreparingInCentiMinPrM3 = 15.84;
    const centiMinPrM3BetweenStripRoads = (timeProcessingInCentiMinPrM3 + timeMovingInCentiMinPrM3 + timeSpentClearingAndPreparingInCentiMinPrM3);
    return centiMinPrM3BetweenStripRoads * volumeHarvestedPrHectareBetweenStripRoads;
}

export function centiMinSpentPrHectareOnStripRoads(
    stripRoadVolume: number,
    volumeHarvestedPrHectareOnStripRoad: number
) {
    const centiMinSpentPrM3OnStripRoads = 81.537 + (29.4662/stripRoadVolume)  + 31.12 * 1.5 + 23.9 / stripRoadVolume + 15.84;
    return centiMinSpentPrM3OnStripRoads * volumeHarvestedPrHectareOnStripRoad;
}