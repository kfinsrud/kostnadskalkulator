export enum TreatmentType {
    PATCH_HARVEST = "PATCH_HARVEST",
    SINGLE_TREE_SELECTION = "SINGLE_TREE_SELECTION",
}

function trunk_rng(
    trunk: number,
    min: number,
    max: number
) {
    return Math.max(min, Math.min(max, trunk));
}

function sr_sp_patch(
    sr_w: number,
    harvest_fraction: number,
    ptch_w: number
) {
    console.log({
        sr_w: sr_w,
        harvest_fraction: harvest_fraction,
        ptch_w: ptch_w
    })
    const result = (
            Math.sqrt(
                sr_w * sr_w
                - 4 * sr_w * harvest_fraction * ptch_w
                + 4 * harvest_fraction * (ptch_w*ptch_w)
            )
            + sr_w
        ) / (2 * harvest_fraction)
    console.log(result);
    return result;
}


export function patchHarvestFJ(
    stems_ha: number = 1200,
    v: number = 0.4,
    harvest_strength_pct: number = 45,
    patch_size_ha: number = 0.6,
    sr_w: number = 4,
    stripRoadExists: boolean = true,
    slope: number = 1,
    surface: number = 1
) {
    let vharv = stems_ha * v * harvest_strength_pct / 100;
    patch_size_ha = trunk_rng(patch_size_ha, 0.01, 0.5);
    const ptch_w = Math.sqrt(patch_size_ha) * 100;
    const sr_sp = sr_sp_patch(
        sr_w,
        harvest_strength_pct / 100,
        ptch_w
    )

    const sr_share_harvest_area = (sr_sp - ptch_w) * sr_w / (harvest_strength_pct * sr_sp*sr_sp /100);
    const nharv_sr = stripRoadExists? 0 : sr_share_harvest_area * stems_ha;
    const vharv_sr = nharv_sr * v;
    const v_sr = stripRoadExists? 0 : vharv_sr / nharv_sr;
    const vharv_bsr = vharv - vharv_sr;
    const v_bsr = v;
    const nharv_bsr = vharv_bsr / v_bsr;
    const nharv = nharv_bsr + nharv_sr;

    return getHarvestTime(
        v_bsr,
        harvest_strength_pct,
        vharv,
        vharv_sr,
        vharv_bsr,
        v,
        v_sr,
        TreatmentType.PATCH_HARVEST,
        stripRoadExists,
        nharv,
        slope,
        surface
    )
}


export function selectionHarvestFJ(
    stems_ha: number = 1200,
    v: number = 0.4,
    harvest_strength_pct: number = 45, // share of basal area to be cut
    patch_size_ha: number = 0.6,
    sr_w: number = 4,
    stripRoadExists: boolean,
    slope: number = 1,
    surface: number = 1
) {

    const vharv = stems_ha * v * harvest_strength_pct / 100;
    const sr_sp = 22;
    const sr_share_harvest_area = sr_w / sr_sp;
    const nharv_sr = stems_ha * sr_share_harvest_area;
    const v_sr = v;
    const vharv_sr = stems_ha * sr_share_harvest_area * v_sr;
    const vharv_bsr = vharv - vharv_sr;
    const v_bsr = v * 1.3; // selektivt valg av trær 30% over snitt av v
    const nharv_bsr = vharv_bsr / v_bsr;
    const nharv = nharv_bsr + nharv_sr;

    return getHarvestTime(
        v_bsr,
        harvest_strength_pct,
        vharv,
        vharv_sr,
        vharv_bsr,
        v,
        v_sr,
        TreatmentType.SINGLE_TREE_SELECTION,
        false,
        nharv,
        slope,
        surface
    )

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
    const terrainFactor = 1 + (50/nharv) - 0.1 * surface - 0.1 * slope;
    let T_cmin_ha = time_bsr_cmin_ha(
        v_bsr,
        sf_factor,
        harvest_strength_pct,
        terrainFactor,
        vharv_bsr
    )

    if(!stripRoadExists) {
        T_cmin_ha += (type===TreatmentType.PATCH_HARVEST) ?
            time_sr_patch(v_sr,vharv_sr,terrainFactor)
            :time_sr_selection(v_sr,vharv_sr,sf_factor,terrainFactor, harvest_strength_pct)
    }

    const harv_G15min_ha = T_cmin_ha * 1.5 / 100;
    const harv_G15min_m3 = harv_G15min_ha / vharv;
    return 60/harv_G15min_m3;
}

function time_bsr_cmin_ha(
    v_bsr: number,
    sf_factor: number,
    harvest_strength_pct: number,
    terrainFactor: number,
    vharv_bsr: number
) {
    return vharv_bsr * (
        time_proc_cmin_m3(v_bsr, sf_factor)
        + time_move_cmin_m3(v_bsr,harvest_strength_pct,terrainFactor)
        + time_clpr_cmin_m3()
    );
}

function time_sr_patch(
    v_sr: number,
    vharv:number,
    terrainFactor: number
){
    console.log({
        v_sr: v_sr,
        vharv: vharv,
        terrainFactor: terrainFactor
    })

    const result = vharv * (81.537 + (29.4662/v_sr)  + 31.12 * 1.5 + 23.9 / (v_sr * terrainFactor) + 15.84);
    console.log(result);
    return result;
}

function time_sr_selection(
    v_sr: number,
    vharv: number,
    sf_factor: number,
    terrainFactor: number,
    harvest_strength_pct: number
){
    return vharv * (81.537 + (29.4662/v_sr)  + 31.12 * sf_factor + 5.756 + 539.574 / (v_sr * harvest_strength_pct * terrainFactor) + 15.84);
}

function time_proc_cmin_m3(
    v_bsr: number,
    sf_factor: number
) {
    return 81.537 + (29.4662 / v_bsr) + 31.12 * sf_factor;
}

function time_move_cmin_m3(
    v_bsr: number,
    harvest_strength_pct: number,
    terrainFactor: number
) {
    return 5.756 + (539.574 / (v_bsr * harvest_strength_pct * terrainFactor));
}

function time_clpr_cmin_m3() {
    return 15.84
}

export function t_forw_bb(
    forw_size: "large" | "medium" | "small",
    modelversion: "Talbot16" | "Brunberg04",
    treatment: "clearcutting" | "thinning",
    harvest_strength_pct: number = 100,
    surface: number = 2,
    slope: number = 2,
    v: number = 0.25,
    Stems_ha: number,
    distance_basveg: number,
    distance_forest: number,
    nbAssortments: number,

) {
    const Vharv = Stems_ha * v * harvest_strength_pct / 100;
    // const Nharv = Vharv / v;

    // t4 calculation
    const a = treatment === "thinning" ? -43 : 5.7;
    const b = treatment === "thinning" ? 25.9 : 11.45;
    const K1 = modelversion === "Talbot16" ? 1.4 : 1;
    let K2;
    if (treatment === "clearcutting") {
        K2 = forw_size === "small" ? 1.04 : forw_size === "medium" ? 0.86 : 0.73;
    } else {
        K2 = forw_size === "small" ? 1.18 : 0.67;
    }
    const Vharv2 = treatment === "thinning"
        ? trunk_rng(Vharv, 25, 125)
        : trunk_rng(Vharv, 50, 350);
    const t4 = K1 * ((a + K2 * Vharv2 + b * Math.sqrt(Vharv2)) / Vharv2);

    // t5 calculation
    let speed = 75 - (8.2 * surface) - (1.4 * Math.pow(slope, 2));
    speed = treatment === "clearcutting" ? speed : 0.85 * speed;
    const c_cap = forw_size === "small" ? 9.5 : forw_size === "medium" ? 13.6 : 17.9;
    const t5 = ((2 * distance_forest / speed + (2 * distance_basveg / 100)) / c_cap);

    // t6 calculation
    const vtr = trunk_rng(v, 0, 0.5);
    const t6 = 0.05 - vtr;

    // t7 calculation
    const t7 = -0.1 + 0.1 * nbAssortments;

    // t8 calculation
    const nbLoads = Math.floor((Vharv / c_cap) + 0.99);
    const t8 = 1.5 * nbLoads;

    // Final calculations
    const t4t7 = t4 + t5 + t6 + t7;
    const forw_G15min_ha = t4t7 * Vharv + t8;
    // const forw_G15min_m3 = Math.round(forw_G15min_ha / Vharv * 10) / 10;
    // const forw_G15h_ha = Math.round((forw_G15min_ha / 60) * 100) / 100;
    return Math.round(60 / (forw_G15min_ha / Vharv) * 100) / 100;
}