const normalizeModelDefine = modelDefine => {
  let normalized = {
    ...modelDefine,
  };

  if(typeof normalized.names === 'string'){
    normalized.names = {
      singular: normalized.names,
      plural: `${normalized.names}s`,
    }
  }

  normalized.extensionConfigs = normalized.extensionConfigs || {};

  return normalized;
};

export default class RestModel
{
  constructor(ns, modelDefine, Creators, methodConfigs){
    this.ns = ns;
    this.modelDefine = normalizeModelDefine(modelDefine);
    this.methodConfigs = methodConfigs;

    const args = {
      ...this.modelDefine,
      ns: this.ns,
      methodConfigs: this.methodConfigs,
      getShared: this.getShared,
      getExposed: this.getExposed,
    };
    delete args.extensionConfigs;

    this.Creators = Creators;
    this.extensions = {
      shared: {},
      exposed: {},
    };

    this.Creators.forEach(Creator => {
      this.extensions.shared[Creator.$name] = {};
      this.extensions.exposed[Creator.$name] = {};

      const creator = new Creator();
      const { shared, exposed } = creator.create(args, this.modelDefine.extensionConfigs[Creator.$name] || {});
      this.extensions.shared[Creator.$name] = shared;
      this.extensions.exposed[Creator.$name] = {
        ...this.extensions.exposed[Creator.$name],
        ...exposed,
      };
      // console.log('shared, exposed :', shared, exposed);
    });
  }

  getShared = (extensionName) => {
    return extensionName ? this.extensions.shared[extensionName] : this.extensions.shared;
  };

  getExposed = (extensionName) => {
    return extensionName ? this.extensions.exposed[extensionName] : this.extensions.exposed;
  };
}
