// Curated, stable Unsplash photo URLs. All verified architecture / interior shots.
// Using explicit photo IDs (not source.unsplash.com) so links never break.

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  heroAerial: u("1600596542815-ffad4c1539a9", 1920),
  heroDuplex: u("1600585154340-be6161a56a0c", 1920),
  exterior1: u("1564013799919-ab600027ffc6"),
  exterior2: u("1605276374104-dee2a0ed3cd6"),
  exterior3: u("1512917774080-9991f1c4c750"),
  exterior4: u("1613490493576-7fde63acd811"),
  duplex1: u("1582268611958-ebfd161ef9cf"),
  duplex2: u("1600566753190-17f0baa2a6c3"),

  interior1: u("1600210492486-724fe5c67fb0"),
  interior2: u("1600585154526-990dced4db0d"),
  interior3: u("1616486338812-3dadae4b4ace"),
  interior4: u("1616594039964-ae9021a400a0"),
  interior5: u("1618221195710-dd6b41faaea6"),
  interior6: u("1617104551722-3b2d51366400"),

  kitchen: u("1600489000022-c2086d79f9d4"),
  bedroom: u("1631679706909-1844bbd07221"),
  bathroom: u("1552321554-5fefe8c9ef14"),
  living: u("1567016432779-094069958ea5"),

  pool: u("1571902943202-507ec2618e8f"),
  gym: u("1540497077202-7c8a3999166f"),
  garden: u("1585320806297-9794b3e4eeae"),
  clubhouse: u("1582719508461-905c673771fd"),
  playground: u("1597926582737-d09a14f8fcec"),
  yoga: u("1545205597-3d9d02c29597"),

  floorplan: u("1545324418-cc1a3fa10c00"),
  blueprint: u("1503387762-592deb58ef4e"),
  location: u("1486325212027-8081e485255e", 1920),
};
