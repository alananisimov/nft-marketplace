interface ImageProps {
  filename: string;
  mimetype: string;
  url: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class ImageEntity {
  private constructor(private props: ImageProps) {}

  static create(
    props: Omit<ImageProps, "createdAt" | "updatedAt">,
  ): ImageEntity {
    return new ImageEntity({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get filename(): string {
    return this.props.filename;
  }

  get mimetype(): string {
    return this.props.mimetype;
  }

  get url(): string {
    return this.props.url;
  }

  toDTO() {
    return {
      filename: this.props.filename,
      mimetype: this.props.mimetype,
      url: this.props.url,
    };
  }
}
