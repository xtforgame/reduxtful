/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import { ModelMap } from 'library';

const { expect } = chai;

describe('Main Test Cases', () => {
  describe('Basic', () => {
    it('ModelMap should be a function', () => {
      expect(ModelMap).to.be.an.instanceof(Function);
      return true;
    });
  });
});
