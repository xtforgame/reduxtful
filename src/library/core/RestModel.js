/* eslint-disable max-len */
const normalizeModelDefine = (modelDefine) => {
  const normalized = {
    ...modelDefine,
  };

  if (typeof normalized.names === 'string') {
    normalized.names = {
      model: normalized.names,
      member: normalized.names,
      collection: `${normalized.names}s`,
    };
  }

  normalized.config = {
    actionNoRedundantBody: true,
    ...normalized.config,
  };

  normalized.extensionConfigs = normalized.extensionConfigs || {};

  return normalized;
};

export default class RestModel {
  constructor(ns, modelDefine, Creators, methodConfigs) {
    this.ns = ns;
    this.modelDefine = normalizeModelDefine(modelDefine);
    this.singleton = !!this.modelDefine.singleton;
    this.methodConfigs = methodConfigs.filter(methodConfig => !this.singleton || methodConfig.isForCollection !== false);

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

    this.Creators.forEach((Creator) => {
      this.extensions.shared[Creator.$name] = {};
      this.extensions.exposed[Creator.$name] = {};

      const creator = new Creator(this);
      const { shared, exposed } = creator.create(args, this.modelDefine.config || {}, this.modelDefine.extensionConfigs[Creator.$name] || {});
      this.extensions.shared[Creator.$name] = shared;
      this.extensions.exposed[Creator.$name] = {
        ...this.extensions.exposed[Creator.$name],
        ...exposed,
      };
      // console.log('shared, exposed :', shared, exposed);
    });
  }

  getShared = extensionName => (extensionName ? this.extensions.shared[extensionName] : this.extensions.shared);

  getExposed = extensionName => (extensionName ? this.extensions.exposed[extensionName] : this.extensions.exposed);
}
