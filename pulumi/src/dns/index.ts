import { Component } from '../component';
import * as desec from '@pulumi/desec';
import * as servers from './servers';
import { NzbrDeComponent } from './nzbr-de';

require('./nzbr-link');

export class DesecComponent extends Component {
    constructor() {
        super(null, 'desec');

        new NzbrDeComponent(this);
    }
}
