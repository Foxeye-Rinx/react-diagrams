import {BaseModel, BaseListener} from "@projectstorm/react-canvas";
import { NodeModel } from "./NodeModel";
import { LinkModel } from "./LinkModel";
import * as _ from "lodash";
import { DiagramEngine } from "../DiagramEngine";

export class PortModel extends BaseModel<NodeModel, BaseListener> {
	name: string;
	links: { [id: string]: LinkModel };
	maximumLinks: number;

	// calculated post rendering so routing can be done correctly
	x: number;
	y: number;
	width: number;
	height: number;

	constructor(name: string, type?: string, maximumLinks?: number) {
		super(type);
		this.name = name;
		this.links = {};
		this.maximumLinks = maximumLinks;
	}

	deSerialize(ob, engine: DiagramEngine, cache) {
		super.deSerialize(ob, engine, cache);
		this.name = ob.name;
		this.maximumLinks = ob.maximumLinks;
	}

	serialize() {
		return _.merge(super.serialize(), {
			name: this.name,
			parentNode: this.parent.id,
			links: _.map(this.links, link => {
				return link.id;
			}),
			maximumLinks: this.maximumLinks
		});
	}

	doClone(lookupTable = {}, clone) {
		clone.links = {};
		clone.parentNode = this.getParent().clone(lookupTable);
	}

	getNode(): NodeModel {
		return this.getParent();
	}

	getName(): string {
		return this.name;
	}

	getMaximumLinks(): number {
		return this.maximumLinks;
	}

	setMaximumLinks(maximumLinks: number) {
		this.maximumLinks = maximumLinks;
	}

	removeLink(link: LinkModel) {
		delete this.links[link.getID()];
	}

	addLink(link: LinkModel) {
		this.links[link.getID()] = link;
	}

	getLinks(): { [id: string]: LinkModel } {
		return this.links;
	}

	public createLinkModel(): LinkModel | null {
		if (_.isFinite(this.maximumLinks)) {
			var numberOfLinks: number = _.size(this.links);
			if (this.maximumLinks === 1 && numberOfLinks >= 1) {
				return _.values(this.links)[0];
			} else if (numberOfLinks >= this.maximumLinks) {
				return null;
			}
		}
		return null;
	}

	updateCoords({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	canLinkToPort(port: PortModel): boolean {
		return true;
	}

	isLocked() {
		return super.isLocked() || this.getParent().isLocked();
	}
}
