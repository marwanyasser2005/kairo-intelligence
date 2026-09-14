
export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // ... (Keep existing common, bill, nav)
    common: {
      loading: "Processing...",
      error: "An error occurred",
      export: "Export Report",
      back: "Back",
      next: "Next",
      start: "Start",
      continue: "Continue",
      view: "View Analysis",
      active: "Active",
      inactive: "Inactive",
      saved: "Saved",
      context: "Context",
      source: "Source",
      methodology: "Methodology",
      egyptContext: "Egypt Context",
      calculationBasis: "Calculation Basis",
      dataPrivacy: "Data Privacy",
      runAnalysis: "Run Simulation",
      reset: "New Session",
      saveSnapshot: "Save Progress",
      apply: "Apply Values",
      cancel: "Cancel",
      remove: "Remove",
      systemStatus: "System Status",
      risk: "Risk",
      refresh: "Refresh",
      alert: {
        saveSuccess: "Session Snapshot Saved! You can resume this state from the Dashboard.",
        resetConfirm: "Start a new session for this module? This clears current inputs.",
        genPlan: "Regenerate Plan?",
        nameSnapshot: "Name your session snapshot:"
      }
    },
    bill: {
      title: "Bill Analysis (Optional)",
      subtitle: "Upload your utility bills for higher precision.",
      uploadTitle: "Upload Bill",
      dropzone: "Drop bill image here or click to browse",
      types: {
        elec: "Electricity",
        water: "Water"
      },
      analyzing: "Extracting data via the configured Gemini vision model...",
      detected: "Detected Values",
      consumption: "Consumption",
      cost: "Total Cost",
      confidence: "AI Confidence",
      useThis: "Use These Values",
      waterStub: "Auto-analysis for water bills coming soon. Please enter values manually.",
      errorSize: "File too large (Max 5MB)",
      errorType: "Images only (JPG, PNG)",
      success: "Data extracted successfully",
      autoAnalyze: "Analyze automatically after extraction",
      analyzeNow: "Analyze now",
      editValues: "Correct values",
      applyEdits: "Apply corrections",
      cancelEdit: "Cancel",
      details: "Extracted details",
      evidence: "Extraction evidence",
      rescan: "Upload another bill",
      quality: {
        high: "High confidence",
        medium: "Medium confidence",
        low: "Low confidence"
      },
      imageOptimized: "Image was resized for faster, more accurate reading",
      unitPrice: "Effective unit price"
    },
    nav: {
      home: "Home",
      dashboard: "Dashboard",
      systems: "Systems",
      logic: "Logic",
      about: "About",
      input: "Input Data",
      roadmap: "My Roadmap",
      monitor: "Environmental Foresight",
      lang: "English",
      systemsList: {
        foodSecurity: "Food Security Intelligence",
        scenarios: "Scenario Lab",
        carbon: "Carbon Intelligence",
        water: "Water Scarcity",
        food: "Food Waste Simulator",
        energy: "Energy Intelligence",
        transport: "Mobility Impact",
        exposure: "Air Quality & Urban Exposure",
        ewaste: "ReKairo E-Waste",
        mini: "Baseline Input"
      }
    },
    home: {
      hero: {
        title: "Environmental Intelligence for Economies Under Constraint.",
        sub: "Kairo converts invisible resource behavior into measurable financial and environmental outcomes using structured AI reasoning. We transform fragmented household data into deterministic climate decisions, aligning financial resilience with environmental responsibility.",
        ctaPrimary: "Initialize Intelligence",
        ctaSecondary: "Review Methodology"
      },
      proof: [
        "Built for High-Scarcity Economies",
        "Powered by Structured AI Reasoning",
        "Localized Environmental Constants",
        "Financial Impact Modeling"
      ],
      reality: {
        title: "The Reality We Operate In",
        points: [
          "Water scarcity approaching absolute thresholds",
          "Rising electricity costs due to cooling demand",
          "Urban pollution exposure",
          "Food system inefficiencies",
          "Premature electronic disposal"
        ],
        closing: "This is not a climate awareness gap. It is an intelligence gap."
      },
      loop: {
        title: "The Intelligence Loop",
        subtitle: "Observe → Interpret → Adapt → Verify",
        steps: {
            1: { title: "Ingestion", desc: "Kairo structures user inputs and optional device context into machine-readable environmental signals.", link: "Data Gateway" },
            2: { title: "Reasoning", desc: "The Core Orchestrator synthesizes user telemetry with localized emission factors, tariff models, and scarcity metrics to produce bounded recommendations.", link: "Core Logic" },
            3: { title: "Adaptation", desc: "Static plans fail in dynamic environments. Kairo continuously recalibrates behavioral guidance using atmospheric and contextual data streams.", link: "Dynamic Monitor" },
            4: { title: "Validation", desc: "Individual adaptation compounds into measurable national resource preservation.", link: "Macro Impact" }
        }
      },
      why: {
        title: "Why Kairo Exists",
        desc: "Traditional carbon tools fail because they are abstract, financially disconnected, and behaviorally ineffective. Kairo was engineered to convert environmental externalities into operational household decisions."
      },
      roi: {
        title: "Intelligence That Pays For Itself",
        desc: "Sustainability adoption accelerates when users see financial return.",
        points: ["Lower utility bills", "Reduced replacement costs", "Recovered device value"],
        closing: "Visibility drives behavior. Behavior drives systemic impact."
      },
      global: {
        title: "Built for Egypt. Engineered for Global Constraint.",
        desc: "Egypt is the ideal proving ground due to climate pressure, population density, and infrastructure strain.",
        quote: "Systems designed for constraint are inherently globally scalable."
      },
      trust: [
        "Localized emission datasets",
        "Satellite atmospheric proxies",
        "National tariff models",
        "Peer-reviewed environmental factors"
      ],
      closing: "Kairo is building the intelligence layer required for responsible resource management in the 21st century."
    },
    about: {
      title: "The Architecture of",
      titleSub: "Resilience.",
      intro: "Kairo is an environmental intelligence layer designed to address the critical intersection of resource scarcity, household economics, and climate physics in the MENA region.",
      mission: "We build decision-support infrastructure that translates invisible consumption patterns into measurable financial and social signals.",
      whitepaper: "Read Technical Whitepaper",
      
      problem: {
        title: "The Problem We Were Built to Solve",
        bridge: "These are not isolated sustainability challenges. They are intelligence failures. People cannot optimize what they cannot measure.",
        vectors: [
            { title: "Resource Pressure", desc: "Egypt is approaching absolute water scarcity. Per-capita availability has fallen below international poverty thresholds, yet household leakage remains invisible." },
            { title: "Energy Economics", desc: "Rising cooling demand drives electricity consumption. Tariff tiers punish small behavioral inefficiencies, creating both financial liability and carbon load." },
            { title: "Food System Leakage", desc: "Avoidable organic waste represents a dual loss: direct financial waste for the family and methane emissions for the atmosphere." },
            { title: "Urban Air Exposure", desc: "Without dense ground sensors, citizens operate without awareness of PM2.5 exposure, treating pollution as a background annoyance rather than a health variable." },
            { title: "Premature Disposal", desc: "Repairable electronics are discarded early, driving import pressure and losing economic value. This is a circular economy failure." }
        ]
      },

      origin: {
        title: "The Evolution into Unified Kairo",
        p1: "Kairo began with a focused behavioral-estimation prototype. It showed that people act more responsibly when environmental outcomes are connected to clear financial value.",
        p2: "That research evolved into today’s unified dashboard: structured evidence, environmental foresight, practical guidance, and connected resource intelligence in one product.",
        statement: "Kairo translates environmental action into clear household economics."
      },

      context: {
        title: "Built for Egypt. Designed for Scale.",
        desc: "Egypt is the proving ground: high climate exposure, rapid urbanization, rising utility costs, and a young digital population.",
        quote: "Systems designed for constraint are inherently globally scalable."
      },

      philosophy: {
        title: "What Makes Kairo Different",
        statements: [
            "Kairo is not a carbon calculator.",
            "Kairo is not an awareness tool.",
            "Kairo is an environmental intelligence layer."
        ],
        desc: "We translate invisible resource behavior into financial and social signals people can act on immediately.",
        tagline: "Visibility drives behavior. Behavior drives impact."
      },

      valuesTitle: "Core Operating Principles",
      values: [
        { title: "Scientific Accuracy", desc: "We rely on localized constants, peer-reviewed emission factors, and structured AI outputs—not estimates." },
        { title: "Planet Before Profit", desc: "Long-term system resilience outweighs short-term growth metrics. We optimize for sustainability." },
        { title: "Human-Centered", desc: "Adoption is the real barrier. Complexity prevents action. We design for friction-less integration." },
        { title: "Measurable Impact", desc: "Assumptions are declared. Outputs are traceable. We avoid black-box environmental claims." }
      ],

      flow: {
        title: "From Insight to Intervention",
        steps: ["Observe", "Interpret", "Recommend", "Verify"],
        desc: "A decision-support system for daily life. This is applied intelligence."
      },

      teamTitle: "The Team",
      teamDesc: "Marwan Abdelghaffar founded Kairo after recognizing that climate responsibility becomes actionable only when translated into household economics. The platform was conceived to bridge environmental science with everyday decision-making across the MENA region.",

      aiArchitecture: {
        title: "Model-Agnostic Intelligence",
        subtitle: "Built for Flexibility and Cost-Efficiency",
        desc: "Kairo routes its AI workload through a secure Gemini multi-model gateway. Models are selected server-side by capability and availability without exposing provider credentials to the browser."
      },

      future: {
        title: "The Future We Are Engineering",
        desc: "Our long-term objective is to build intelligence infrastructure capable of supporting households, institutions, and cities. Sustainability must evolve from aspiration into operational behavior.",
        closing: "Kairo exists to make responsible resource management the default, not the exception."
      }
    },
    // ... keep other sections
    dashboard: {
      title: "Unified Intelligence Unit",
      subtitle: "Real-time telemetry and risk aggregation.",
      score: "Sustainability Score",
      health: "System Health",
      financialRisk: "Total Financial Leakage",
      financialRiskSub: "EGP / Month Wasted",
      carbonLiability: "Net Carbon Liability",
      carbonLiabilitySub: "kg CO₂e / Month",
      waterSecurity: "Water Security",
      waterSecuritySub: "People supported by recovery",
      priorityActions: "Critical Interventions",
      matrix: "System Matrix",
      alerts: "Live Alerts",
      noAlerts: "All systems nominal. No critical risks detected.",
      quickActions: "Quick Actions",
      resume: "Resume Analysis",
      journey: {
        title: "Optimization Journey",
        step1: "Telemetry",
        step2: "Action Plan",
        step3: "Environmental Foresight",
        step4: "Impact",
        desc: "Complete these steps to unlock full system capabilities."
      },
      status: {
        critical: "Critical",
        high: "High Risk",
        moderate: "Moderate",
        good: "Optimal",
        offline: "Offline",
        low: "Low Risk"
      },
      alertsList: {
        energy: "Energy efficiency critical (<50%)",
        water: "Severe water leakage detected",
        air: "High pollution exposure risk",
        finance: "Monthly financial waste > 1000 EGP"
      },
      audienceMode: {
        title: "View Mode",
        individual: "Individual",
        corporate: "Corporate",
        school: "Education",
        government: "Government"
      },
      liveMonitor: {
        title: "Live Air Status",
        connect: "Connect Sensor",
        connected: "Online",
        satelliteSync: "Satellite Sync",
        gisLayers: "GIS Layers Active",
        spatialAccuracy: "Spatial Accuracy",
        telemetryUplink: "Telemetry Uplink",
        sentinelFeed: "Sentinel-5P Feed",
        copernicusFeed: "Copernicus CAMS",
        auraoMI: "Aura OMI Layer",
        aodLayer: "Aerosol Optical Depth",
        scanningAtmosphere: "Scanning atmosphere...",
        layersLoaded: "spatial layers loaded",
        coordinateMatch: "Coordinate match",
        signalQuality: "Signal Quality",
        updateRate: "Layer Update Rate",
        geoMatch: "Geo-Coordinate Match",
        systemSync: "Synced with Satellite Network",
        commandCenter: "Remote Sensing Command Center",
        atmosphericAnalysis: "Atmospheric Layer Analysis",
        multispectral: "Multispectral Feed Active"
      }
    },
    sdg: {
      title: "Sustainable Development Goals",
      badge: "SDG",
      sdg2: { num: "2", title: "Zero Hunger", short: "Food Security" },
      sdg3: { num: "3", title: "Good Health & Well-being", short: "Health" },
      sdg6: { num: "6", title: "Clean Water & Sanitation", short: "Clean Water" },
      sdg7: { num: "7", title: "Affordable & Clean Energy", short: "Clean Energy" },
      sdg11: { num: "11", title: "Sustainable Cities", short: "Sust. Cities" },
      sdg12: { num: "12", title: "Responsible Consumption", short: "Resp. Consumption" },
      sdg13: { num: "13", title: "Climate Action", short: "Climate" },
      impact: "SDG Impact",
      serves: "This module serves",
      alignment: "SDG Alignment"
    },
    foodSecurity: {
      title: "Food Security Intelligence",
      subtitle: "Supply Chain & Agricultural Water Analysis",
      badge: "Applied Environmental Research",
      description: "AI-powered analysis of Egypt's food supply chain efficiency, agricultural water consumption, and climate impact on crop productivity.",
      inputs: {
        title: "Supply Chain Inputs",
        cropType: "Primary Crop Type",
        irrigationMethod: "Irrigation Method",
        landArea: "Agricultural Land Area (Feddan)",
        waterSource: "Water Source",
        season: "Growing Season",
        cropOptions: {
          wheat: "Wheat",
          rice: "Rice",
          corn: "Corn",
          cotton: "Cotton",
          vegetables: "Vegetables",
          fruits: "Fruits"
        },
        irrigationOptions: {
          flood: "Flood Irrigation",
          drip: "Drip Irrigation",
          sprinkler: "Sprinkler",
          furrow: "Furrow Irrigation"
        },
        waterOptions: {
          nile: "Nile Water",
          groundwater: "Groundwater",
          rainwater: "Rainwater",
          treated: "Treated Wastewater"
        },
        seasonOptions: {
          summer: "Summer",
          winter: "Winter",
          nili: "Nili (Flood Season)"
        }
      },
      metrics: {
        waterFootprint: "Water Footprint",
        waterFootprintUnit: "m³/ton",
        irrigationEfficiency: "Irrigation Efficiency",
        foodLossRate: "Post-Harvest Loss Rate",
        supplyChainScore: "Supply Chain Score",
        carbonPerTon: "Carbon per Ton Produced",
        waterPerCalorie: "Water per 1000 kcal"
      },
      analysis: {
        title: "AI Supply Chain Diagnosis",
        stages: {
          production: "Production",
          harvest: "Harvest",
          storage: "Storage",
          transport: "Transport",
          distribution: "Distribution"
        },
        bottleneck: "Bottleneck Stage",
        lossPoint: "Primary Loss Point",
        recommendation: "Optimization Pathway"
      },
      climate: {
        title: "Climate Impact on Agriculture",
        temperatureRise: "Temperature Rise Impact",
        waterStressIndex: "Water Stress Index",
        yieldRisk: "Yield Risk Assessment",
        adaptationScore: "Climate Adaptation Score"
      },
      egypt: {
        context: "Egypt Agricultural Context",
        nileShare: "Egypt's Nile Water Share",
        nileShareValue: "55.5 billion m³/year",
        agriWaterUse: "Agricultural Water Use",
        agriWaterValue: "80% of total freshwater",
        foodImportDep: "Food Import Dependency",
        foodImportValue: "~40% of caloric needs",
        scarcityLine: "Water Scarcity Line",
        scarcityValue: "<550 m³/capita/year"
      },
      runAnalysis: "Run Food Security Analysis",
      analyzing: "Analyzing supply chain data..."
    },
    research: {
      badge: "Applied Research Project",
      track7: "Water Science & Food Security",
      track2: "AI & Machine Learning",
      sdgAlignment: "SDG Alignment",
      competitionMode: "Research Mode",
      submissionReady: "Evidence Ready",
      internationalComp: "Open Environmental Platform",
      nileUniversity: "Research & Community"
    },
    mini: {
      step: "Step 01: Ingestion",
      title: "Data Telemetry Terminal",
      desc: "Hydrate the Kairo Core engine with your household consumption patterns. Use AI estimation for instant profiling or manual override for precision.",
      quickEst: "Quick Estimation",
      manual: "Manual Calibration",
      ingest: "Ingest to Core Engine",
      newRun: "Start New Run",
      poweredBy: "Estimations powered by CAPMAS & HCWW Averages",
      ocr: {
        drop: "Drop Bill Image Here",
        scan: "Extracting Data...",
        success: "Extraction Success"
      }
    },
    action: {
      title: "Your Roadmap",
      desc: "A prioritized, science-backed path to reducing your footprint in Egypt.",
      center: "Climate Action Center",
      actionsTaken: "Actions Taken",
      regenerate: "Regenerate Plan",
      returnDash: "Return to Dashboard",
      status: "Plan Status",
      myActions: "01 • My Climate Actions",
      commitment: "02 • Commitment",
      strategic: "03 • Strategic Analysis",
      analyzing: "Analyzing Data Patterns...",
      consulting: "Consulting Planning Engine against regional benchmarks.",
      tabs: { daily: "Daily Habits", weekly: "Weekly Habits", monthly: "Monthly Habits" },
      target: {
        title: "Set Reduction Target",
        desc: "Commit to a personal monthly goal. Visualize your potential CO₂ reduction.",
        current: "Current Baseline",
        goal: "Target Goal",
        ambitious: "Ambitious",
        saving: "Saving"
      }
    },
    water: {
      title: "Water Scarcity Reasoning",
      desc: "Analyze volumetric loss and economic impact of household leaks.",
      console: "Hydrologic Console",
      coreSystem: "Core System",
      faucets: "Dripping Faucets",
      toilets: "Running Toilets",
      hhSize: "Household Size",
      duration: "Leak Duration (Hrs/Day)",
      loss: "Volumetric Loss",
      cost: "Economic Impact",
      people: "People Supported",
      justification: "Justification",
      context: "National Context",
      recs: "Recommendations",
      synced: "Synced with Kairo Dashboard"
    },
    food: {
      title: "Food Waste Simulator",
      desc: "Convert organic waste data into financial loss models.",
      console: "Supply Chain Console",
      meals: "Wasted Meals / Week",
      cost: "Cost / Meal (EGP)",
      loss: "Annual Loss",
      leakage: "System Leakage",
      methane: "Methane Load",
      savings: "Potential Savings",
      season: "Ramadan / Feast Season"
    },
    energy: {
      title: "Energy Intelligence",
      desc: "Audit AC usage against regional climate data.",
      params: "Parameters",
      monthlyCons: "Monthly Consumption (kWh)",
      calcResult: "Calculated Bill",
      tier: "Tier",
      runLogic: "Run Thermal Audit",
      score: "Efficiency Score",
      comfort: "Comfort Analysis",
      schedule: "Optimization Schedule",
      acTemp: "AC Temperature Setpoint",
      archNoteTitle: "Note",
      archNote: "Calculations use 2024/2025 Egyptian Electricity Tariffs.",
      meterType: "Meter Type",
      meterOptions: { old: "Old Mechanical", prepaid: "Prepaid Card", smart: "Smart Meter" },
      region: "Region",
      regionOptions: { cairo: "Greater Cairo", delta: "Delta", saeed: "Upper Egypt (Hot)", coast: "North Coast" }
    },
    transport: {
      title: "Mobility Impact",
      desc: "Calculate commute footprint and offset requirements.",
      mode: "Mode",
      modeOptions: {
        car_gas: "Private Car (Gasoline)",
        car_ev: "Private Car (Electric)",
        uber: "Uber/Taxi",
        bus: "Public Bus",
        micro: "Microbus",
        metro: "Metro/Train",
        moto: "Motorcycle"
      },
      distance: "Daily Distance (km)",
      calculate: "Calculate",
      footprint: "Monthly Footprint",
      offset: "Offset Required",
      rating: "Efficiency Rating",
      trees: "Trees",
      switch: "Switch Recommendation",
      save: "Potential Saving"
    },
    exposure: {
      title: "Urban Exposure",
      desc: "Estimate pollution intake via satellite proxy.",
      console: "Exposure Parameters",
      location: "Location",
      hours: "Hours Outdoors",
      commute: "Commute Method",
      aqi: "Estimated AQI",
      pm25: "PM2.5",
      health: "Health Impact",
      mitigation: "Mitigation",
      methodology: "Methodology",
      disclaimer: "Scientific Disclaimer"
    },
    ewaste: {
      title: "Circular Economy Engine",
      desc: "Lifecycle routing for ICT e-waste.",
      deviceType: "Device Type",
      model: "Model",
      condition: "Condition",
      notes: "Notes",
      calculate: "Calculate Pathway",
      pathway: "Optimal Pathway",
      value: "Retained Value",
      avoided: "CO₂ Avoided",
      social: "Social Score",
      diverted: "Waste Diverted",
      mining: "Urban Mining Potential",
      options: {
        laptop: "Laptop", smartphone: "Smartphone", tablet: "Tablet", desktop: "Desktop",
        cond_a: "Like New", cond_b: "Good", cond_c: "Damaged", cond_d: "Non-Functional", cond_e: "Obsolete"
      },
      extras: {
        box: "Original Box & Receipt?",
        battery: "Battery Health (%)"
      },
      tokenRouter: {
        title: "System Logic",
        input: { title: "Input Processing", attr: "Attributes", context: "Market Context", vars: "Variables" },
        core: { title: "Core Reasoning", var: "Variable Weighting", audit: "Condition Audit", opt: "Optimization" },
        output: { title: "Output Generation", schema: "Strict JSON Schema", enum: "Action Enums", metrics: "Impact Metrics" },
        effect: { title: "System Effect", routing: "Proper Routing", hydration: "Data Hydration" },
        justification: { title: "Justification", desc: "Why we use AI for this? The secondary market for electronics is highly volatile. Static rules engines cannot account for model-specific resale value vs. raw material value fluctuations." }
      },
      arch: {
        title: "System Logic",
        problem: { title: "The Problem", desc: "E-waste contains valuable materials often lost to landfills.", toxic: "Toxic Risk", toxicDesc: "Improper disposal leaks toxins." },
        logic: { title: "Ingestion Logic", desc: "Matches device specs against secondary market data." },
        decision: { title: "Routing Decision", desc: "Selects between Reuse, Repair, or Recycle." },
        output: { title: "Quantitative Output", desc: "Generates financial and environmental metrics." },
        quote: "Closing the loop on electronics.",
        quoteLabel: "Vision"
      }
    },
    features: {
      title: "System Capabilities",
      titleSub: "Engineered for Egypt.",
      desc: "Kairo aggregates specialized neural modules to tackle specific resource vectors.",
      deploy: "Deploy System",
      deployDesc: "Start your personal climate audit today.",
      capabilities: {
        carbon: { title: "Carbon Engine", problem: "Emissions are invisible.", outcome: "Quantified footprint." },
        water: { title: "Water Logic", problem: "Leaks are ignored.", outcome: "Volumetric savings." },
        food: { title: "Food Supply", problem: "Organic waste.", outcome: "Financial recovery." },
        air: { title: "Air Monitor", problem: "Pollution is vague.", outcome: "Health guidance." },
        mini: { title: "Baseline Estimator", problem: "Data entry is hard.", outcome: "Instant estimation." }
      },
      footer: {
        tokenRouter: "Powered by Gemini", tokenRouterSub: "Free Multi-model Gateway",
        context: "Context Aware", contextSub: "Localized Data",
        compute: "Edge Compute", computeSub: "Low Latency"
      }
    },
    learn: {
      title: "Knowledge Base",
      desc: "Understand the science behind the crisis.",
      readGuide: "Read Guide",
      water: { title: "Water Scarcity", desc: "Why Egypt is below the water poverty line." },
      food: { title: "Food Security", desc: "The cost of waste in the supply chain." },
      co2: { title: "Carbon Emissions", desc: "Understanding your footprint." },
      sust: { title: "Sustainability", desc: "Long term habits." }
    },
    impact: {
      badge: "National Impact",
      title: "Impact Report",
      desc: "Visualizing the collective power of individual action.",
      unit: "Unit Economics",
      water: { title: "Water", desc: "Liters saved per household." },
      money: { title: "Financial", desc: "EGP saved per household." },
      carbon: { title: "Carbon", desc: "Emissions avoided." },
      national: { title: "National Scale", desc: "If everyone did it.", pool: "Pools", poolSub: "Water Saved", car: "Cars", carSub: "Off road" },
      method: { title: "Methodology", desc: "How we calculate impact." },
      sources: "Data Sources"
    },
    education: {
        back: "Back to Learn",
        insights: "Key Insights",
        startAudit: "Start Audit",
        water: { title: "Water Crisis", subtitle: "Nile Delta Context", facts: [{title:"Scarcity", fact:"<550m3/capita"}, {title:"Agriculture", fact:"80% usage"}, {title:"Leakage", fact:"30% network loss"}], action: {title:"Audit Water", desc:"Check your home leaks."} },
        food: { title: "Food Waste", subtitle: "Economic Loss", facts: [{title:"Loss", fact:"73kg/person"}, {title:"Cost", fact:"50B EGP/yr"}, {title:"Methane", fact:"High impact"}], action: {title:"Audit Food", desc:"Track your waste."} },
        co2: { title: "Carbon", subtitle: "Global Warming", facts: [{title:"Egypt", fact:"0.6% global"}, {title:"Growth", fact:"Rising fast"}, {title:"Energy", fact:"Gas dependent"}], action: {title:"Audit Energy", desc:"Check your AC."} },
        sust: { title: "Sustainability", subtitle: "Lifestyle", facts: [{title:"Habits", fact:"Small changes"}, {title:"Impact", fact:"Long term"}, {title:"Community", fact:"Spread word"}], action: {title:"Start Journey", desc:"Begin now."} }
    },
    monitor: {
      title: "Live Atmosphere",
      desc: "Real-time analysis of satellite proxy data for your location.",
      activate: "Activate Sensor",
      calibrating: "Calibrating Sensors...",
      ask: "Ask AI Assistant",
      detected: "Detected Location",
      pollutants: "Detailed Pollutants",
      guidance: "Daily Guidance",
      why: "Why this matters",
      aqi: "AQI",
      aqiLong: "Air Quality Index",
      saved: "Saved to Dashboard",
      co: "Carbon Monoxide (CO)",
      mix: "Live Satellite/Station Mix",
      fineParticles: "Fine particles",
      dust: "Dust & smoke",
      traffic: "Traffic emissions",
      ozone: "Ground-level ozone",
      outdoors: "Outdoors",
      indoors: "Indoors",
      takeControl: "Take Control",
      reduceContrib: "Don't just watch the numbers. Reduce your contribution.",
      check: "Check",
      ok: "OK",
      levels: {
        good: "Good",
        moderate: "Moderate",
        unhealthy: "Unhealthy",
        sensitive: "Sensitive",
        hazardous: "Hazardous"
      }
    },
    exposureReport: {
        title: "Urban Exposure Analysis",
        desc: "Quantify your daily intake of particulate matter.",
        location: "Target Location",
        hours: "Hours Spent Outdoors",
        commute: "Commute Method",
        analyze: "Run Exposure Model",
        riskLevel: "Exposure Risk Level",
        annualIntake: "Est. Annual Intake",
        peakTimes: "Peak Pollution Times",
        mitigation: "Mitigation Strategy",
        awaiting: "Awaiting Input",
        awaitingDesc: "Enter your location and commute details to model respiratory risk.",
        options: { walking: "Walking", bicycle: "Bicycle", bus: "Public Bus", metro: "Metro", car: "Private Car", motorcycle: "Motorcycle" }
    },
    airQuality: {
        badge: "Environmental Foresight",
        title: "Air Quality",
        desc: "Real-time satellite data.",
        estimate: "Estimate My Exposure",
        location: "Location"
    },
    trivia: {
        title: "Did You Know?",
        facts: [
            "Egypt faces an annual water deficit of 20 billion cubic meters.",
            "A dripping tap can waste 20,000 liters of water a year.",
            "Food waste in landfills generates methane, 25x more potent than CO2."
        ]
    },
    tech: {
        title: "Technical Architecture",
        desc: "How Kairo processes data.",
        orchestrator: { title: "The Orchestrator", desc: "Central logic unit." },
        why: { title: "Why Gemini routing?", desc: "Secure capability-aware model fallback." },
        modules: { title: "Modules", water: "Water", carbon: "Carbon", air: "Air" },
        pipeline: { title: "Data Pipeline", steps: ["Ingest", "Process", "Reason", "Output", "Validation"] },
        blackBox: {
            badge: "Deep Dive", title: "Inside the Box", desc: "Gemini multi-model processing flow.",
            steps: [
                { role: "Input", title: "Sanitization", desc: "Cleaning user data." },
                { role: "Context", title: "RAG", desc: "Fetching local constants." },
                { role: "Core", title: "Reasoning", desc: "Applying logic." },
                { role: "Output", title: "Verification", desc: "Safety checks." }
            ]
        },
        zero: { title: "Zero Hallucination", desc: "Strict schema enforcement.", margin: "Margin", confidence: "Confidence", high: "High" },
        code: {
            title: "Orchestrator Logic",
            comment1: "// Why server-side Gemini orchestration matters",
            comment2: "// 1. Force deeper reasoning for trade-offs",
            comment3: "// 2. Strict Output Mode",
            comment4: "// 3. Deterministic Seeding"
        }
    },
    tokenRouterArch: {
        title: "Gemini AI Gateway Architecture",
        subtitle: "Integration Strategy",
        desc: "Secure server-side integration with a configurable model gateway.",
        sections: { neg: "What it isn't", fail: "Failure Modes", pipe: "Pipeline", req: "Requirements" },
        cards: {
            chatbot: { title: "Not a Chatbot", desc: "Deterministic logic." },
            rag: { title: "Not just RAG", desc: "Active reasoning." },
            wrapper: { title: "Not a Wrapper", desc: "Full system." }
        },
        failure: {
            conflict: "Conflict Resolution", conflictDesc: "Solving trade-offs.",
            example: "Example", 
            objA: "Objective A", 
            exampleObjA: "Save Water (Turn off evaporative cooling).",
            objB: "Objective B", 
            exampleObjB: "Save Energy (Evaporative cooling is more efficient than dry cooling).",
            result: "Resolution",
            exampleResult: "A standard LLM will suggest 'Do both,' which is physically impossible. Kairo uses multi-step logic to calculate the Net Carbon Delta of each path.",
            temporal: "Temporal", temporalDesc: "Time-based logic.",
            constraint: "Constraint", constraintDesc: "Physical limits."
        },
        pipeline: { handoffTitle: "Handoff", handoffDesc: "Seamless transition." },
        reqs: {
            thinking: { title: "Thinking", desc: "Chain of thought." },
            schema: { title: "Schema", desc: "JSON output." },
            context: { title: "Context", desc: "Large window." }
        }
    },
    miniSystem: {
        badge: "Architecture",
        title: "Kairo Baseline System",
        desc: "Low-latency ingestion engine.",
        friction: { title: "Reducing Friction", desc: "Making input easy." },
        flow: { title: "Data Flow", step1: "Input", step2: "Process", step3: "Output" },
        cta: "Try it now"
    },
    scenarios: {
        title: "Scenario Lab",
        desc: "Compare future states.",
        snapshot: "Create Snapshot",
        save: "Save",
        empty: "No scenarios saved.",
        runMini: "Build a baseline",
        savedTitle: "Saved Scenarios",
        run: "Run Comparison",
        metrics: { co2: "CO2", water: "Water", loss: "Financial Loss" },
        analysis: { optimal: "Optimal Path", tradeoff: "Trade-off", diff: "Key Differences" }
    },
    csr: {
        title: "CSR Dashboard",
        desc: "Corporate Sustainability Reporting.",
        export: "Export Report",
        employees: "Employees",
        intensity: "Carbon Intensity",
        audit: "Audit Score",
        offset: "Offsets",
        greenwashing: "Greenwashing Detector",
        verify: "Verify Claim",
        supply: "Supply Chain",
        compliance: "Compliance",
        chartTitle: "Scope 1 & 2 Emissions Trend",
        scopeActual: "Actual",
        scopeTarget: "Target",
        gwPlaceholder: 'Enter claim (e.g. "We are 100% eco-friendly...")',
        confidence: "Confidence",
        flags: "Red Flags",
        suggestion: "Suggestion"
    }
  },
  ar: {
    // ... (Keep existing common, bill, nav)
    common: {
      loading: "جارٍ التحميل...",
      error: "حصلت مشكلة. جرّب مرة تانية.",
      export: "حمّل التقرير",
      back: "رجوع",
      next: "الخطوة التالية",
      start: "ابدأ",
      continue: "كمّل",
      view: "راجع التحليل",
      active: "متاح",
      inactive: "غير متاح",
      saved: "تم الحفظ",
      context: "سياقك الحالي",
      source: "المصدر",
      methodology: "المنهجية",
      egyptContext: "السياق المصري",
      calculationBasis: "أساس الحساب",
      dataPrivacy: "خصوصية بياناتك",
      runAnalysis: "شغّل التحليل",
      reset: "ابدأ من جديد",
      saveSnapshot: "احفظ النتيجة",
      apply: "استخدم القيم دي",
      cancel: "إلغاء",
      remove: "حذف",
      systemStatus: "حالة النظام",
      risk: "مستوى الخطر",
      refresh: "تحديث",
      alert: {
        saveSuccess: "تم حفظ نسخة من النتيجة. تقدر ترجع لها من لوحة المتابعة.",
        resetConfirm: "هل تريد البدء من جديد وحذف البيانات التي أدخلتها هنا؟",
        genPlan: "هل تريد إنشاء الخطة من جديد؟",
        nameSnapshot: "اكتب اسمًا واضحًا للنسخة:"
      }
    },
    bill: {
      title: "تحليل الفاتورة",
      subtitle: "ارفع صورة واضحة للفاتورة، وراجع البيانات المستخرجة قبل استخدامها.",
      uploadTitle: "ارفع فاتورتك",
      dropzone: "اسحب صورة الفاتورة هنا، أو اضغط لاختيارها",
      types: {
        elec: "كهرباء",
        water: "مياه"
      },
      analyzing: "جارٍ قراءة الفاتورة واستخراج البيانات...",
      detected: "البيانات المستخرجة",
      consumption: "الاستهلاك",
      cost: "التكلفة الكلية",
      confidence: "درجة الثقة في الاستخراج",
      useThis: "استخدم القيم دي",
      waterStub: "القراءة التلقائية لفواتير المياه قيد التطوير. أدخل القيم يدويًا حاليًا.",
      errorSize: "حجم الملف أكبر من ٥ ميجابايت",
      errorType: "ارفع صورة بصيغة JPG أو PNG",
      success: "تم استخراج البيانات. راجعها قبل المتابعة.",
      autoAnalyze: "حلّل تلقائيًا بعد الاستخراج",
      analyzeNow: "حلّل الآن",
      editValues: "صحّح القيم",
      applyEdits: "طبّق التصحيحات",
      cancelEdit: "إلغاء",
      details: "تفاصيل الاستخراج",
      evidence: "أساس الاستخراج",
      rescan: "ارفع فاتورة أخرى",
      quality: {
        high: "ثقة عالية",
        medium: "ثقة متوسطة",
        low: "ثقة منخفضة"
      },
      imageOptimized: "تم تصغير الصورة لقراءة أسرع وأدق",
      unitPrice: "سعر الوحدة الفعلي"
    },
    nav: {
      home: "الرئيسية",
      dashboard: "المتابعة",
      systems: "الأنظمة",
      logic: "كيف يفكر Kairo",
      about: "عن كايرو",
      input: "أدخل بياناتك",
      roadmap: "خطتك",
      monitor: "الاستباق البيئي",
      lang: "العربية",
      systemsList: {
        foodSecurity: "أمنك الغذائي",
        scenarios: "مختبر السيناريوهات",
        carbon: "بصمتك الكربونية",
        water: "ذكاء المياه والندرة",
        food: "تقليل هدر الطعام",
        energy: "ذكاء استهلاك الطاقة",
        transport: "التنقل منخفض الأثر",
        exposure: "جودة الهواء والتعرض الحضري",
        ewaste: "إلكترونياتك القديمة",
        mini: "البيانات الأساسية"
      }
    },
    home: {
      hero: {
        title: "ذكاء بيئي لاقتصادات الندرة، متفصل عشانك.",
        sub: "كايرو بتحول استهلاكك الغايب عن عينك لنتيجة تقدر تقيسها بفلوس وبصمة بيئية. بناخد بيانات بيتك ونترجمها لقرارات تخليك توفر ميزانيتك وفي نفس الوقت تحافظ على الكوكب.",
        ctaPrimary: "ابدأ تقييمك",
        ctaSecondary: "شوف بنحسب إزاي"
      },
      proof: [
        "متصمم لاقتصاديات الندرة",
        "شغال بذكاء اصطناعي منظم",
        "أرقام بيئية من بلدك",
        "قياس توفير الفلوس"
      ],
      reality: {
        title: "ده الواقع اللي بنعيشه",
        points: [
          "نصيبنا من الماية بيقل جامد وبيوصل لخط الفقر",
          "فواتير الكهربا بتضرب بسبب التكييفات",
          "التعرض العالي للتلوث في الزحمة",
          "أكل كتير بيترمي ومبيستفادش بيه",
          "بنتخلص من الإلكترونيات بسرعة قبل وقتها"
        ],
        closing: "المشكلة مش بس نقص وعي.. دي فجوة في الذكاء البيئي."
      },
      loop: {
        title: "دايرة الذكاء الخاصة بينا",
        subtitle: "راقب ← افهم ← اتأقلم ← اتأكد",
        steps: {
            1: { title: "تجميع", desc: "كايرو ينظّم مدخلات المستخدم وسياق الجهاز الاختياري ويحولها لإشارات بيئية قابلة للمعالجة.", link: "بوابة البيانات" },
            2: { title: "تحليل منطقي", desc: "كايرو بيربط استهلاكك بأسعار الكهربا في مصر ومستويات الانبعاثات الحالية عشان يديك حلول متفصلة.", link: "المخ الأساسي" },
            3: { title: "تأقلم", desc: "الخطط الثابتة مبتنفعش، عشان كده كايرو على طول بيعمل تحديث لنسايحه بناءً على جودة الهوا والمعطيات الحالية.", link: "المراقبة" },
            4: { title: "تأكيد", desc: "خطواتك البسيطة في بيتك بتتجمع عشان تكون تأثير وطني حقيقي.", link: "تأثيرك الكبير" }
        }
      },
      why: {
        title: "إيه لزمة كايرو؟",
        desc: "أدوات قياس البصمة الكربونية التقليدية تفشل لأنها بعيدة عن جيب المواطن. احنا عملنا كايرو عشان نحول الأزمة البيئية لقرارات توفرلك في بيتك."
      },
      roi: {
        title: "ذكاء بيوفر ثمنه لوحده",
        desc: "الاستدامة بتيجي أسرع لما تشوف بعينك التوفير في جيبك.",
        points: ["فواتير أقل", "متدفعش في تصليحات ملهاش لزمة", "استفيد من أجهزتك القديمة"],
        closing: "لما تشوف الصورة كاملة، هتغير سلوكك، وتخلق تأثير حقيقي."
      },
      global: {
        title: "مبني لمصر، ومتصمم للمواقف العالمية الصعبة.",
        desc: "مصر تعتبر أحسن مكان نجرب فيه: الجو بيتغير، زحمة، أسعار الحاجة بتزيد، وفي نفس الوقت الشباب مهتم بحلول ديجيتال.",
        quote: "أي سيستم بيتصمم للظروف الصعبة، بيقدر ينجح عالميا."
      },
      trust: [
        "بيانات انبعاثات محلية",
        "تحليلات الهوا بالصور الفضائية",
        "حسابات مبنية على شرائح الكهربا والماية في مصر",
        "معايير علمية موثقة"
      ],
      closing: "كايرو بتبني مخ بيئي تقدر تعتبره دليل شخصي ليك عشان تدير استهلاكك صح."
    },
    about: {
      title: "هندسة",
      titleSub: "مرونة وبقاء.",
      intro: "كايرو هي طبقة ذكاء بيئي اتعملت مخصوص عشان تحل المعادلة الصعبة: نقص الموارد، وميزانية بيتك، والتغيرات المناخية في مصر والشرق الأوسط.",
      mission: "بنبني سيستم ذكي بيترجم استهلاكك اللي مش واخد بالك منه لأرقام ونتايج تقدر تقيسها وتوفر بيها.",
      whitepaper: "اقرأ الورقة التقنية",
      
      problem: {
        title: "المشكلة اللي جينا نحلها",
        bridge: "دي مش مجرد تحديات بيئية أو مناخية.. دي نقص في الرؤية. محدش هيقدر يصلح حاجة مش قادر يقيسها ويشوف تكلفتها.",
        vectors: [
            { title: "أزمة الماية", desc: "مصر بتقرب من خط الفقر المائي، ونصيب الفرد بيقل، وفي نفس الوقت لسه في استهلاك مهدر جوه البيوت من غير ما نحس بيه." },
            { title: "حسبة الكهربا", desc: "التكييفات بقت بتسحب كهربا كتير. والشرائح بتعاقبك على تصرفات صغيرة ممكن تخليك تدفع أرقام خيالية وكمان بتزود الانبعاثات." },
            { title: "أكل بيترمي", desc: "بواقي الأكل المرمية خسارة من الناحيتين: فلوس بتترمي من ميزانيتك، وغاز ميثان بيضر البيئة." },
            { title: "هوا الزحمة", desc: "من غير حساسات تقيس، بتنزل الشارع وسط تلوث وميكروبات دقيقة (PM2.5) وأنت مش حاسس، وده بياثر على صحتك بالبطيء." },
            { title: "إلكترونيات بتترمي بدري", desc: "أجهزة كتير لسه شغالة أو تتصلح بنرميها، وده بيزود العبء على الاستيراد وبنخسر فلوس، بدل ما نعيد تدويرها." }
        ]
      },

      origin: {
        title: "تطور كايرو إلى منصة موحدة",
        p1: "بدأت كايرو بنموذج بحثي مركز على التقديرات السلوكية، وأثبت أن ربط الأثر البيئي بقيمة مالية واضحة يساعد الناس على اتخاذ قرارات أفضل.",
        p2: "تطور البحث إلى لوحة متابعة موحدة تجمع الأدلة المنظمة والاستباق البيئي والتوجيه العملي وذكاء الموارد داخل منتج واحد.",
        statement: "كايرو بتحول أي كلام عن الاستدامة لأرقام وفلوس توفرها في بيتك."
      },

      context: {
        title: "مبني لمصر. متصمم عشان يكبر.",
        desc: "مصر تعتبر أحسن مكان نختبر فيه: جو بيتغير، زحمة، أسعار بتغلى، وفي نفس الوقت شباب بيحب التكنولوجيا.",
        quote: "أي سيستم بينجح في أصعب الظروف، بيقدر ينجح عالمياً."
      },

      philosophy: {
        title: "إيه اللي بيميز كايرو",
        statements: [
            "كايرو مش آلة حاسبة كربون.",
            "كايرو مش أداة توعية وبس.",
            "كايرو ده مخ بيئي متكامل."
        ],
        desc: "بنترجم سحب الموارد واستهلاكك الفعلي لقرارات واضحة تقدر تنفذها وتوفر بيها من دلوقتي.",
        tagline: "لما تفهم الصورة صح، هتغير سلوكك وتخلق تأثير حقيقي."
      },

      valuesTitle: "مبادئنا الأساسية",
      values: [
        { title: "دقة علمية", desc: "بنعتمد على أسعار وفواتير بجد، ومعايير حسابات الانبعاثات الحالية، وذكاء اصطناعي منظم—مفيش هنا شغل تقديرات تقريبية." },
        { title: "الكوكب قبل المكسب", desc: "بنفكر دايماً إزاي نبني سيستم يستمر وينقذ البيئة، مش مجرد أرقام بنكبر بيها مؤقتاً." },
        { title: "التركيز على الإنسان", desc: "علشان السيستم ينجح لازم الناس تستخدمه، عشان كده خلينا الموضوع بسيط ومن غير تعقيدات." },
        { title: "تأثير متقاس", desc: "دايماً بنوضح إحنا حسبناها إزاي ومفيش ادعاءات بيئية وهمية." }
      ],

      flow: {
        title: "من الرؤية للحل الفعلي",
        steps: ["راقب", "افهم", "خذ نصيحة", "اتأكد"],
        desc: "نظام بيدعم قراراتك اليومية.. ده هو الذكاء اللي بيفيدك بجد."
      },

      teamTitle: "مؤسس المشروع",
      teamDesc: "مروان عبد الغفار أسس كايرو بعد ما أدرك إن الحفاظ على البيئة مش هيبقى له معنى إلا لما يرتبط بميزانية الأسرة. المنصة دي اتعملت عشان تربط بين علوم البيئة والقرارات اللي بناخدها في حياتنا اليومية في مصر والشرق الأوسط.",

      aiArchitecture: {
        title: "ذكاء مفتوح وغير مقيد",
        subtitle: "متصمم عشان يكون مرن وموفر",
        desc: "كايرو بيوجّه شغل الذكاء الاصطناعي من خلال بوابة Gemini آمنة ومتعددة النماذج. السيرفر بيختار النموذج المناسب حسب المهمة والتوافر من غير ما المفتاح يظهر في المتصفح."
      },

      future: {
        title: "المستقبل اللي بنبنيه",
        desc: "هدفنا نوصل نبني بنية ذكية تدعم البيوت، والشركات، والمدن كلها. الاستدامة لازم تتحول من مجرد حلم لأسلوب حياة طبيعي بيحصل كل يوم.",
        closing: "كايرو معمولة عشان تخلي إدارة مواردنا صح هي الأساس، مش مجرد استثناء."
      }
    },
    // ... keep other sections
    dashboard: {
      title: "وحدة التحكم المركزية",
      subtitle: "تجميع المخاطر والقياسات في الوقت الفعلي.",
      score: "درجة الاستدامة",
      health: "صحة النظام",
      financialRisk: "إجمالي الهدر المالي",
      financialRiskSub: "جنيه / شهر مهدر",
      carbonLiability: "صافي عبء الكربون",
      carbonLiabilitySub: "كجم CO₂ / شهر",
      waterSecurity: "أمن المياه",
      waterSecuritySub: "الأشخاص المدعومون بالاسترداد",
      priorityActions: "التدخلات الحرجة",
      matrix: "مصفوفة الأنظمة",
      alerts: "تنبيهات حية",
      noAlerts: "جميع الأنظمة مستقرة. لا توجد مخاطر حرجة.",
      quickActions: "إجراءات سريعة",
      resume: "استئناف التحليل",
      journey: {
        title: "رحلة التحسين",
        step1: "القياسات",
        step2: "الخطة",
        step3: "الاستباق البيئي",
        step4: "التأثير",
        desc: "أكمل هذه الخطوات لفتح قدرات النظام بالكامل."
      },
      status: {
        critical: "حرج جداً",
        high: "خطر مرتفع",
        moderate: "متوسط",
        good: "مثالي",
        offline: "غير متصل",
        low: "خطر منخفض"
      },
      alertsList: {
        energy: "كفاءة التكييفات منخفضة (<٥٠٪)",
        water: "تم رصد تسريب مياه خطير",
        air: "جودة الهوا مش تمام، خلي بالك",
        finance: "الهدر المالي كسر الـ ١٠٠٠ جنيه/شهر"
      },
      audienceMode: {
        title: "وضع العرض",
        individual: "أفراد",
        corporate: "شركات",
        school: "تعليم",
        government: "حكومة"
      },
      liveMonitor: {
        title: "حالة الجو الحية",
        connect: "توصيل المستشعر",
        connected: "متصل",
        satelliteSync: "مزامنة الأقمار الصناعية",
        gisLayers: "طبقات GIS نشطة",
        spatialAccuracy: "الدقة المكانية",
        telemetryUplink: "رابط البيانات عن بُعد",
        sentinelFeed: "بيانات Sentinel-5P",
        copernicusFeed: "نموذج Copernicus CAMS",
        auraoMI: "طبقة Aura OMI",
        aodLayer: "عمق الهباء الجوي البصري",
        scanningAtmosphere: "جارٍ مسح الغلاف الجوي...",
        layersLoaded: "طبقة مكانية محملة",
        coordinateMatch: "تطابق الإحداثيات",
        signalQuality: "جودة الإشارة",
        updateRate: "معدل تحديث الطبقات",
        geoMatch: "مطابقة الإحداثيات الجغرافية",
        systemSync: "متزامن مع شبكة الأقمار",
        commandCenter: "مركز الاستشعار عن بُعد",
        atmosphericAnalysis: "تحليل طبقات الغلاف الجوي",
        multispectral: "التغذية متعددة الأطياف نشطة"
      }
    },
    sdg: {
      title: "أهداف التنمية المستدامة",
      badge: "هدف تنمية",
      sdg2: { num: "٢", title: "القضاء على الجوع", short: "الأمن الغذائي" },
      sdg3: { num: "٣", title: "الصحة الجيدة والرفاه", short: "الصحة" },
      sdg6: { num: "٦", title: "المياه النظيفة والصرف الصحي", short: "مياه نظيفة" },
      sdg7: { num: "٧", title: "الطاقة النظيفة وبأسعار معقولة", short: "طاقة نظيفة" },
      sdg11: { num: "١١", title: "مدن ومجتمعات مستدامة", short: "مدن مستدامة" },
      sdg12: { num: "١٢", title: "الاستهلاك والإنتاج المسؤولان", short: "استهلاك مسؤول" },
      sdg13: { num: "١٣", title: "العمل المناخي", short: "المناخ" },
      impact: "أثر أهداف التنمية المستدامة",
      serves: "هذا النظام يخدم",
      alignment: "التوافق مع أهداف التنمية"
    },
    foodSecurity: {
      title: "ذكاء الأمن الغذائي",
      subtitle: "تحليل سلسلة التوريد والمياه الزراعية",
      badge: "بحث بيئي تطبيقي",
      description: "تحليل مدعوم بالذكاء الاصطناعي لكفاءة سلسلة الإمداد الغذائي في مصر واستهلاك المياه الزراعية وتأثير المناخ على إنتاجية المحاصيل.",
      inputs: {
        title: "مدخلات سلسلة التوريد",
        cropType: "نوع المحصول الرئيسي",
        irrigationMethod: "طريقة الري",
        landArea: "مساحة الأرض الزراعية (فدان)",
        waterSource: "مصدر المياه",
        season: "موسم الزراعة",
        cropOptions: {
          wheat: "قمح",
          rice: "أرز",
          corn: "ذرة",
          cotton: "قطن",
          vegetables: "خضروات",
          fruits: "فاكهة"
        },
        irrigationOptions: {
          flood: "ري بالغمر",
          drip: "ري بالتنقيط",
          sprinkler: "رش",
          furrow: "ري بالأحواض"
        },
        waterOptions: {
          nile: "مياه النيل",
          groundwater: "المياه الجوفية",
          rainwater: "مياه الأمطار",
          treated: "مياه صرف معالجة"
        },
        seasonOptions: {
          summer: "صيفي",
          winter: "شتوي",
          nili: "نيلي (موسم الفيضان)"
        }
      },
      metrics: {
        waterFootprint: "البصمة المائية",
        waterFootprintUnit: "م³/طن",
        irrigationEfficiency: "كفاءة الري",
        foodLossRate: "معدل الفقد ما بعد الحصاد",
        supplyChainScore: "درجة سلسلة التوريد",
        carbonPerTon: "الكربون لكل طن منتَج",
        waterPerCalorie: "المياه لكل ١٠٠٠ سعرة"
      },
      analysis: {
        title: "تشخيص سلسلة التوريد بالذكاء الاصطناعي",
        stages: {
          production: "الإنتاج",
          harvest: "الحصاد",
          storage: "التخزين",
          transport: "النقل",
          distribution: "التوزيع"
        },
        bottleneck: "مرحلة الاختناق",
        lossPoint: "نقطة الفقد الرئيسية",
        recommendation: "مسار التحسين"
      },
      climate: {
        title: "تأثير المناخ على الزراعة",
        temperatureRise: "تأثير ارتفاع درجة الحرارة",
        waterStressIndex: "مؤشر الإجهاد المائي",
        yieldRisk: "تقييم مخاطر المحصول",
        adaptationScore: "درجة التكيف المناخي"
      },
      egypt: {
        context: "السياق الزراعي المصري",
        nileShare: "حصة مصر من مياه النيل",
        nileShareValue: "٥٥.٥ مليار م³/سنة",
        agriWaterUse: "استخدام المياه الزراعية",
        agriWaterValue: "٨٠٪ من إجمالي المياه العذبة",
        foodImportDep: "الاعتماد على استيراد الغذاء",
        foodImportValue: "~٤٠٪ من الاحتياجات السعرية",
        scarcityLine: "خط ندرة المياه",
        scarcityValue: "<٥٥٠ م³/فرد/سنة"
      },
      runAnalysis: "تشغيل تحليل الأمن الغذائي",
      analyzing: "جارٍ تحليل بيانات سلسلة التوريد..."
    },
    research: {
      badge: "مشروع بحثي تطبيقي",
      track7: "علوم المياه والأمن الغذائي",
      track2: "الذكاء الاصطناعي والتعلم الآلي",
      sdgAlignment: "التوافق مع أهداف التنمية المستدامة",
      competitionMode: "وضع البحث",
      submissionReady: "الأدلة جاهزة",
      internationalComp: "منصة بيئية مفتوحة",
      nileUniversity: "بحث ومجتمع"
    },
    mini: {
      step: "الخطوة ٠١: الاستيعاب",
      title: "محطة بيانات القياس",
      desc: "قم بتغذية محرك كايرو الأساسي بأنماط استهلاك أسرتك. استخدم تقدير الذكاء الاصطناعي للتنميط الفوري أو التجاوز اليدوي للدقة.",
      quickEst: "تقدير سريع",
      manual: "المعايرة اليدوية",
      ingest: "إرسال للمحرك الأساسي",
      newRun: "بدء تشغيل جديد",
      poweredBy: "التقديرات مدعومة بمتوسطات الجهاز المركزي للتعبئة العامة والإحصاء والشركة القابضة لمياه الشرب",
      ocr: {
        drop: "أسقط صورة الفاتورة هنا",
        scan: "جارٍ استخراج البيانات...",
        success: "تم الاستخراج بنجاح"
      }
    },
    action: {
      title: "خارطة طريقك",
      desc: "مسار ذو أولوية ومدعوم بالعلم لتقليل بصمتك في مصر.",
      center: "مركز العمل المناخي",
      actionsTaken: "الإجراءات المتخذة",
      regenerate: "تجديد الخطة",
      returnDash: "العودة للوحة التحكم",
      status: "حالة الخطة",
      myActions: "٠١ • إجراءاتي المناخية",
      commitment: "٠٢ • الالتزام",
      strategic: "٠٣ • التحليل الاستراتيجي",
      analyzing: "جارٍ تحليل أنماط البيانات...",
      consulting: "استشارة محرك التخطيط مقابل المعايير الإقليمية.",
      tabs: { daily: "عادات يومية", weekly: "عادات أسبوعية", monthly: "عادات شهرية" },
      target: {
        title: "تحديد هدف الخفض",
        desc: "التزم بهدف شهري شخصي. تخيل الخفض المحتمل في ثاني أكسيد الكربون.",
        current: "الأساس الحالي",
        goal: "الهدف المستهدف",
        ambitious: "طموح",
        saving: "توفير"
      }
    },
    water: {
      title: "نظام استدلال ندرة المياه",
      desc: "تحليل الخسارة الحجمية والأثر الاقتصادي للتسربات المنزلية.",
      console: "وحدة التحكم الهيدرولوجية",
      coreSystem: "النظام الأساسي",
      faucets: "حنفية بتنقط",
      toilets: "سيفون بيسرب",
      hhSize: "عدد أفراد الأسرة",
      duration: "مدة التسريب (ساعة/يوم)",
      loss: "المياه المهدرة",
      cost: "الخسارة المالية",
      people: "يكفي لاستهلاك",
      justification: "التحليل المنطقي",
      context: "السياق القومي",
      recs: "التوصيات الهندسية",
      synced: "متزامن مع لوحة متابعة كايرو"
    },
    food: {
      title: "محاكي هدر الطعام",
      desc: "تحويل بيانات النفايات العضوية إلى نماذج خسارة مالية.",
      console: "وحدة تحكم سلسلة التوريد",
      meals: "وجبات مهدرة / أسبوع",
      cost: "تكلفة / وجبة (ج.م)",
      loss: "الخسارة السنوية",
      leakage: "تسرب النظام",
      methane: "حمل الميثان",
      savings: "التوفير المحتمل",
      season: "موسم رمضان / الأعياد"
    },
    energy: {
      title: "ذكاء الطاقة",
      desc: "تدقيق استخدام التكييف مقابل بيانات المناخ الإقليمية.",
      params: "المعاملات",
      monthlyCons: "الاستهلاك الشهري (ك.و.س)",
      calcResult: "الفاتورة المحسوبة",
      tier: "الشريحة",
      runLogic: "تشغيل التدقيق الحراري",
      score: "درجة الكفاءة",
      comfort: "تحليل الراحة",
      schedule: "جدول التحسين",
      acTemp: "درجة ضبط التكييف",
      archNoteTitle: "ملاحظة",
      archNote: "تستخدم الحسابات تعريفات الكهرباء المصرية ٢٠٢٤/٢٠٢٥.",
      meterType: "نوع العداد",
      meterOptions: { old: "ميكانيكي قديم", prepaid: "كارت مسبق الدفع", smart: "عداد ذكي" },
      region: "المنطقة",
      regionOptions: { cairo: "القاهرة الكبرى", delta: "الدلتا", saeed: "صعيد مصر (حار)", coast: "الساحل الشمالي" }
    },
    transport: {
      title: "أثر التنقل",
      desc: "حساب البصمة الكربونية لتنقلاتك اليومية واكتشاف بدائل أنظف.",
      mode: "الوسيلة",
      modeOptions: {
        car_gas: "سيارة خاصة (بنزين)",
        car_ev: "سيارة خاصة (كهرباء)",
        uber: "أوبر / تاكسي",
        bus: "أتوبيس عام",
        micro: "ميكروباص",
        metro: "مترو / قطار",
        moto: "موتوسيكل"
      },
      distance: "المسافة اليومية (كم)",
      calculate: "حساب",
      footprint: "البصمة الشهرية",
      offset: "التعويض المطلوب",
      rating: "تصنيف الكفاءة",
      trees: "أشجار",
      switch: "توصية التحويل",
      save: "توفير محتمل"
    },
    exposure: {
      title: "التعرض الحضري",
      desc: "تقدير مدخول التلوث عبر وكيل الأقمار الصناعية.",
      console: "معاملات التعرض",
      location: "الموقع",
      hours: "ساعات بالخارج",
      commute: "طريقة التنقل",
      aqi: "مؤشر الهواء المقدر",
      pm25: "جسيمات دقيقة",
      health: "الأثر الصحي",
      mitigation: "التخفيف",
      methodology: "المنهجية",
      disclaimer: "إخلاء مسؤولية علمي"
    },
    ewaste: {
      title: "محرك الاقتصاد الدائري",
      desc: "توجيه دورة الحياة للنفايات الإلكترونية.",
      deviceType: "نوع الجهاز",
      model: "الموديل",
      condition: "الحالة",
      notes: "ملاحظات",
      calculate: "حساب المسار",
      pathway: "المسار الأمثل",
      value: "القيمة المحتفظ بها",
      avoided: "تجنب CO₂",
      social: "الدرجة الاجتماعية",
      diverted: "نفايات محولة",
      mining: "إمكانية التعدين",
      options: {
        laptop: "لابتوب", smartphone: "هاتف ذكي", tablet: "تابلت", desktop: "كمبيوتر مكتبي",
        cond_a: "كالجديد", cond_b: "جيد", cond_c: "تالف", cond_d: "لا يعمل", cond_e: "قديم"
      },
      extras: {
        box: "هل العلبة والفاتورة موجودين؟",
        battery: "صحة البطارية (%)"
      },
      tokenRouter: {
        title: "منطق النظام",
        input: { title: "معالجة المدخلات", attr: "الخصائص", context: "سياق السوق", vars: "المتغيرات" },
        core: { title: "الاستدلال الأساسي", var: "وزن المتغيرات", audit: "تدقيق الحالة", opt: "التحسين" },
        output: { title: "توليد المخرجات", schema: "مخطط JSON صارم", enum: "تعداد الإجراءات", metrics: "مقاييس التأثير" },
        effect: { title: "تأثير النظام", routing: "التوجيه الصحيح", hydration: "إثراء البيانات" },
        justification: { title: "المبرر", desc: "لماذا نستخدم الذكاء الاصطناعي؟ السوق الثانوي للإلكترونيات متقلب للغاية. القواعد الثابتة لا يمكنها حساب قيمة إعادة البيع الخاصة بالموديل مقابل تقلبات أسعار المواد الخام." }
      },
      arch: {
        title: "منطق النظام",
        problem: { title: "المشكلة", desc: "تحتوي النفايات الإلكترونية على مواد قيمة تضيع غالباً في مدافن النفايات.", toxic: "خطر سام", toxicDesc: "التخلص غير السليم يسرب السموم." },
        logic: { title: "منطق الاستيعاب", desc: "يطابق مواصفات الجهاز مع بيانات السوق الثانوية." },
        decision: { title: "قرار التوجيه", desc: "يختار بين إعادة الاستخدام، الإصلاح، أو إعادة التدوير." },
        output: { title: "الإخراج الكمي", desc: "يولد مقاييس مالية وبيئية." },
        quote: "إغلاق الدائرة للإلكترونيات.",
        quoteLabel: "الرؤية"
      }
    },
    features: {
      title: "قدرات النظام",
      titleSub: "صمم لمصر.",
      desc: "يجمع كايرو وحدات عصبية متخصصة لمعالجة نواقل الموارد المحددة.",
      deploy: "نشر النظام",
      deployDesc: "ابدأ تدقيقك المناخي الشخصي اليوم.",
      capabilities: {
        carbon: { title: "محرك الكربون", problem: "الانبعاثات غير مرئية.", outcome: "بصمة محددة الكمية." },
        water: { title: "منطق المياه", problem: "يتم تجاهل التسربات.", outcome: "توفير حجمي." },
        food: { title: "إمدادات الغذاء", problem: "النفايات العضوية.", outcome: "الاسترداد المالي." },
        air: { title: "مراقب الهواء", problem: "التلوث غامض.", outcome: "إرشادات صحية." },
        mini: { title: "مُقدّر البيانات الأساسية", problem: "إدخال البيانات صعب.", outcome: "تقدير فوري." }
      },
      footer: {
        tokenRouter: "مدعوم بواسطة Gemini", tokenRouterSub: "بوابة مجانية متعددة النماذج",
        context: "مدرك للسياق", contextSub: "بيانات محلية",
        compute: "حوسبة الحافة", computeSub: "زمن انتقال منخفض"
      }
    },
    learn: {
      title: "قاعدة المعرفة",
      desc: "افهم العلم وراء الأزمة.",
      readGuide: "اقرأ الدليل",
      water: { title: "ندرة المياه", desc: "لماذا تقع مصر تحت خط الفقر المائي." },
      food: { title: "الأمن الغذائي", desc: "تكلفة الهدر في سلسلة التوريد." },
      co2: { title: "انبعاثات الكربون", desc: "فهم بصمتك." },
      sust: { title: "الاستدامة", desc: "عادات طويلة الأمد." }
    },
    impact: {
      badge: "التأثير الوطني",
      title: "تقرير التأثير",
      desc: "تصور القوة الجماعية للعمل الفردي.",
      unit: "اقتصاديات الوحدة",
      water: { title: "مياه", desc: "لترات موفرة لكل أسرة." },
      money: { title: "مالي", desc: "جنيه موفر لكل أسرة." },
      carbon: { title: "كربون", desc: "انبعاثات متجنبة." },
      national: { title: "النطاق الوطني", desc: "لو فعل الجميع ذلك.", pool: "مسابح", poolSub: "مياه موفرة", car: "سيارات", carSub: "خارج الطريق" },
      method: { title: "المنهجية", desc: "كيف نحسب التأثير." },
      sources: "مصادر البيانات"
    },
    education: {
        back: "عودة للتعلم",
        insights: "رؤى رئيسية",
        startAudit: "ابدأ التدقيق",
        water: { title: "أزمة المياه", subtitle: "سياق دلتا النيل", facts: [{title:"الندرة", fact:"<550m3/فرد"}, {title:"الزراعة", fact:"80% استخدام"}, {title:"التسرب", fact:"30% فقد الشبكة"}], action: {title:"تدقيق المياه", desc:"افحص تسربات منزلك."} },
        food: { title: "هدر الطعام", subtitle: "خسارة اقتصادية", facts: [{title:"الخسارة", fact:"73كجم/فرد"}, {title:"التكلفة", fact:"50 مليار ج.م/سنة"}, {title:"الميثان", fact:"تأثير عالي"}], action: {title:"تدقيق الغذاء", desc:"تتبع هدرك."} },
        co2: { title: "الكربون", subtitle: "الاحتباس الحراري", facts: [{title:"مصر", fact:"0.6% عالمياً"}, {title:"النمو", fact:"يرتفع بسرعة"}, {title:"الطاقة", fact:"يعتمد على الغاز"}], action: {title:"تدقيق الطاقة", desc:"افحص التكييف."} },
        sust: { title: "الاستدامة", subtitle: "نط الحياة", facts: [{title:"العادات", fact:"تغييرات صغيرة"}, {title:"التأثير", fact:"طويل الأمد"}, {title:"المجتمع", fact:"انشر الكلمة"}], action: {title:"ابدأ الرحلة", desc:"ابدأ الآن."} }
    },
    monitor: {
      title: "الغلاف الجوي المباشر",
      desc: "تحليل في الوقت الفعلي لبيانات الأقمار الصناعية لموقعك.",
      activate: "تنشيط المستشعر",
      calibrating: "معايرة المستشعرات...",
      ask: "اسأل المساعد الذكي",
      detected: "الموقع المكتشف",
      pollutants: "الملوثات التفصيلية",
      guidance: "التوجيه اليومي",
      why: "لماذا هذا مهم",
      aqi: "مؤشر جودة الهواء",
      aqiLong: "مؤشر جودة الهواء (AQI)",
      saved: "تم الحفظ في لوحة التحكم",
      co: "أول أكسيد الكربون (CO)",
      mix: "مزيج حي من الأقمار الصناعية والمحطات",
      fineParticles: "جسيمات دقيقة",
      dust: "غبار ودخان",
      traffic: "انبعاثات المرور",
      ozone: "أوزون أرضي",
      outdoors: "في الخارج",
      indoors: "في الداخل",
      takeControl: "تحكم في الوضع",
      reduceContrib: "لا تكتفِ بمراقبة الأرقام. قلل من مساهمتك.",
      check: "افحص",
      ok: "جيد",
      levels: {
        good: "جيد",
        moderate: "متوسط",
        unhealthy: "غير صحي",
        sensitive: "حساس",
        hazardous: "خطر"
      }
    },
    exposureReport: {
        title: "تحليل التعرض الحضري",
        desc: "تحديد مدخولك اليومي من الجسيمات الدقيقة.",
        location: "الموقع المستهدف",
        hours: "ساعات قضاها في الخارج",
        commute: "طريقة التنقل",
        analyze: "تشغيل نموذج التعرض",
        riskLevel: "مستوى خطر التعرض",
        annualIntake: "تقدير المدخول السنوي",
        peakTimes: "أوقات ذروة التلوث",
        mitigation: "استراتيجية التخفيف",
        awaiting: "بانتظار الإدخال",
        awaitingDesc: "أدخل موقعك وتفاصيل تنقلك لنمذجة الخطر التنفسي.",
        options: { walking: "مشي", bicycle: "دراجة", bus: "حافلة عامة", metro: "مترو", car: "سيارة خاصة", motorcycle: "دراجة نارية" }
    },
    airQuality: {
        badge: "مراقب حي",
        title: "جودة الهواء",
        desc: "بيانات أقمار صناعية مباشرة.",
        estimate: "تقدير تعرضي",
        location: "الموقع"
    },
    trivia: {
        title: "هل تعلم؟",
        facts: [
            "تواجه مصر عجزاً مائياً سنوياً قدره 20 مليار متر مكعب.",
            "صنبور يقطر يمكن أن يهدر 20,000 لتر من الماء سنوياً.",
            "تولد نفايات الطعام في مدافن النفايات الميثان، أقوى 25 مرة من CO2."
        ]
    },
    tech: {
        title: "البنية التقنية",
        desc: "كيف يعالج كايرو البيانات.",
        orchestrator: { title: "المنسق", desc: "وحدة المنطق المركزية." },
        why: { title: "لماذا توجيه Gemini؟", desc: "اختيار آمن للنموذج حسب المهمة." },
        modules: { title: "الوحدات", water: "مياه", carbon: "كربون", air: "هواء" },
        pipeline: { title: "خط أنابيب البيانات", steps: ["استيعاب", "معالجة", "استدلال", "إخراج", "تحقق"] },
        blackBox: {
            badge: "تعمق", title: "داخل الصندوق", desc: "تدفق المعالجة متعدد النماذج عبر Gemini.",
            steps: [
                { role: "إدخال", title: "تعقيم", desc: "تنظيف بيانات المستخدم." },
                { role: "سياق", title: "RAG", desc: "جلب الثوابت المحلية." },
                { role: "نواة", title: "استدلال", desc: "تطبيق المنطق." },
                { role: "إخراج", title: "تحقق", desc: "فحوصات السلامة." }
            ]
        },
        zero: { title: "صفر هلوسة", desc: "فرض مخطط صارم.", margin: "هامش", confidence: "ثقة", high: "عالية" },
        code: {
            title: "منطق المنسق",
            comment1: "// لماذا تنسيق Gemini من خلال السيرفر مهم",
            comment2: "// 1. فرض التفكير العميق للمقايضات",
            comment3: "// 2. وضع إخراج صارم",
            comment4: "// 3. بذر حتمي للنتائج"
        }
    },
    tokenRouterArch: {
        title: "هندسة بوابة Gemini",
        subtitle: "استراتيجية التكامل",
        desc: "تكامل آمن من خلال السيرفر مع بوابة نماذج قابلة للضبط.",
        sections: { neg: "ما ليس هو", fail: "أنماط الفشل", pipe: "خط الأنابيب", req: "المتطلبات" },
        cards: {
            chatbot: { title: "ليس روبوت دردشة", desc: "منطق حتمي." },
            rag: { title: "ليس فقط RAG", desc: "استدلال نشط." },
            wrapper: { title: "ليس غلافاً", desc: "نظام كامل." }
        },
        failure: {
            conflict: "حل النزاع", conflictDesc: "حل المقايضات.",
            example: "مثال", 
            objA: "هدف أ", 
            exampleObjA: "توفير المياه (إيقاف التبريد التبخيري).",
            objB: "هدف ب", 
            exampleObjB: "توفير الطاقة (التبريد التبخيري أكثر كفاءة من التبريد الجاف).",
            result: "الحل",
            exampleResult: "سيقترح النموذج اللغوي العادي 'القيام بكلا الأمرين'، وهو أمر مستحيل فيزيائياً. يستخدم كايرو منطقاً متعدد الخطوات لحساب صافي فرق الكربون لكل مسار.",
            temporal: "زمني", temporalDesc: "منطق قائم على الوقت.",
            constraint: "قيد", constraintDesc: "حدود فيزيائية."
        },
        pipeline: { handoffTitle: "تسليم", handoffDesc: "انتقال سلس." },
        reqs: {
            thinking: { title: "تفكير", desc: "سلسلة الأفكار." },
            schema: { title: "مخطط", desc: "إخراج JSON." },
            context: { title: "سياق", desc: "نافذة كبيرة." }
        }
    },
    miniSystem: {
        badge: "هندسة",
        title: "نظام البيانات الأساسية",
        desc: "محرك استيعاب منخفض الكمون.",
        friction: { title: "تقليل الاحتكاك", desc: "جعل الإدخال سهلاً." },
        flow: { title: "تدفق البيانات", step1: "إدخال", step2: "معالجة", step3: "إخراج" },
        cta: "جربه الآن"
    },
    scenarios: {
        title: "مختبر السيناريوهات",
        desc: "قارن الحالات المستقبلية.",
        snapshot: "إنشاء لقطة",
        save: "حفظ",
        empty: "لا سيناريوهات محفوظة.",
        runMini: "أنشئ خط أساس",
        savedTitle: "السيناريوهات المحفوظة",
        run: "تشغيل المقارنة",
        metrics: { co2: "CO2", water: "مياه", loss: "خسارة مالية" },
        analysis: { optimal: "المسار الأمثل", tradeoff: "مقايضة", diff: "الفروق الرئيسية" }
    },
    csr: {
        title: "لوحة CSR",
        desc: "تقارير استدامة الشركات.",
        export: "تصدير التقرير",
        employees: "موظفون",
        intensity: "كثافة الكربون",
        audit: "درجة التدقيق",
        offset: "تعويضات",
        greenwashing: "كاشف الغسل الأخضر",
        verify: "تحقق من الادعاء",
        supply: "سلسلة التوريد",
        compliance: "الامتثال",
        chartTitle: "اتجاه انبعاثات النطاق ١ و ٢",
        scopeActual: "فعلي",
        scopeTarget: "مستهدف",
        gwPlaceholder: 'أدخل الادعاء (مثل "نحن صديقون للبيئة بنسبة ١٠٠٪...")',
        confidence: "الثقة",
        flags: "علامات خطر",
        suggestion: "اقتراح"
    }
  }
};
